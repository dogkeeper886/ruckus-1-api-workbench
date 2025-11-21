.PHONY: clean backend frontend dev stop help status

help:
	@echo "RUCKUS 1 API Workbench - Process Management"
	@echo ""
	@echo "Usage:"
	@echo "  make clean      - Kill all old backend and MCP server processes"
	@echo "  make backend    - Clean and start backend (auto-starts MCP server)"
	@echo "  make frontend   - Start frontend"
	@echo "  make dev        - Clean and start both backend and frontend"
	@echo "  make stop       - Stop all services"
	@echo "  make status     - Show running processes"
	@echo ""

status:
	@echo "Checking running processes..."
	@echo ""
	@echo "Backend (port 3003):"
	@lsof -i :3003 2>/dev/null | grep LISTEN || echo "  Not running"
	@echo ""
	@echo "Frontend (port 3002):"
	@lsof -i :3002 2>/dev/null | grep LISTEN || echo "  Not running"
	@echo ""
	@echo "MCP Server processes:"
	@pgrep -f "ts-node.*mcpServer" > /dev/null && pgrep -af "ts-node.*mcpServer" || echo "  Not running"
	@echo ""

clean:
	@echo "🧹 Cleaning up old processes..."
	@echo ""
	@echo "Killing process on port 3003 (backend)..."
	@-fuser -k 3003/tcp 2>/dev/null && echo "  Killed backend on port 3003" || echo "  Port 3003 is free"
	@echo ""
	@echo "Killing process on port 3002 (frontend)..."
	@-fuser -k 3002/tcp 2>/dev/null && echo "  Killed frontend on port 3002" || echo "  Port 3002 is free"
	@echo ""
	@echo "Killing remaining MCP server processes..."
	@-ps aux | grep '[t]s-node.*mcpServer.ts' | awk '{print $$2}' | xargs -r kill -9 2>/dev/null && echo "  Killed MCP servers" || echo "  No MCP servers found"
	@echo ""
	@sleep 1
	@echo "✅ Cleanup complete"
	@echo ""

backend: clean
	@echo "🚀 Starting backend..."
	@echo ""
	@echo "Loading .env from backend/.env"
	@cd backend && npm run dev

frontend:
	@echo "🚀 Starting frontend..."
	@echo ""
	@cd frontend && npm run dev

dev: clean
	@echo "🚀 Starting both backend and frontend..."
	@echo ""
	@echo "Note: This will start both services in parallel"
	@echo "      Backend logs will be mixed with frontend logs"
	@echo "      For separate logs, use 'make backend' and 'make frontend' in different terminals"
	@echo ""
	@sleep 2
	@(cd backend && npm run dev) & (sleep 3 && cd frontend && npm run dev)

stop:
	@make clean
	@echo "All services stopped"

