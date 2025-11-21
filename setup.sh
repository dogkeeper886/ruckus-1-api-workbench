#!/bin/bash

echo "================================"
echo "RUCKUS 1 API Workbench Setup"
echo "================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi

echo "✓ Node.js $(node -v) detected"
echo ""

# Backend setup
echo "Setting up backend..."
cd backend || exit 1

if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env with your RUCKUS One credentials"
else
    echo "✓ .env file already exists"
fi

echo "Installing backend dependencies..."
npm install

echo "Building backend..."
npm run build

echo "✓ Backend setup complete"
echo ""

# Frontend setup
echo "Setting up frontend..."
cd ../frontend || exit 1

echo "Installing frontend dependencies..."
npm install

echo "✓ Frontend setup complete"
echo ""

# Final instructions
cd ..
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Configure your RUCKUS One credentials:"
echo "   Edit: backend/.env"
echo "   Required:"
echo "     - RUCKUS_TENANT_ID"
echo "     - RUCKUS_CLIENT_ID"
echo "     - RUCKUS_CLIENT_SECRET"
echo "     - RUCKUS_REGION (optional: us, eu, asia)"
echo ""
echo "2. Start the backend server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4. Open your browser:"
echo "   http://localhost:3002"
echo ""
echo "================================"
