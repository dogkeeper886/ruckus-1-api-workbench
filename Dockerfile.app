# =============================================================================
# Stage 1: Build Frontend
# =============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy shared types (frontend imports from ../../../shared/types)
COPY shared/ ./shared/

# Copy frontend package files
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend (outputs to dist/)
RUN npm run build

# =============================================================================
# Stage 2: Build Backend and MCP Server
# =============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy shared types (needed by backend)
COPY shared/ ./shared/

# Build MCP Server first
WORKDIR /app/ruckus1-mcp
COPY ruckus1-mcp/package*.json ./
RUN npm ci
COPY ruckus1-mcp/ ./
RUN npm run build

# Build Backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

# =============================================================================
# Stage 3: Production Image
# =============================================================================
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copy backend production dependencies
COPY --from=backend-builder /app/backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend build output (includes shared/)
COPY --from=backend-builder /app/backend/dist ./dist

# Copy MCP server production dependencies
WORKDIR /app/mcp
COPY --from=backend-builder /app/ruckus1-mcp/package*.json ./
RUN npm ci --only=production

# Copy MCP server build output
COPY --from=backend-builder /app/ruckus1-mcp/dist ./dist

# Copy frontend static files (for nginx to serve)
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create directory for logs
RUN mkdir -p /app/logs && chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

WORKDIR /app/backend

# Environment variables
ENV NODE_ENV=production
ENV PORT=3003

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

# Start with dumb-init for proper signal handling
# Note: backend dist structure is dist/backend/src/server.js due to tsconfig include paths
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/backend/src/server.js"]
