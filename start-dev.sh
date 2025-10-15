#!/bin/bash

# Job Queue Manager - Development Startup Script

echo "🚀 Starting Job Queue Manager Development Environment"
echo ""

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL
echo "📦 Starting PostgreSQL container..."
docker-compose up -d

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 3

# Check if Python virtual environment exists for backend
if [ ! -d "backend/venv" ]; then
    echo "🐍 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
else
    echo "✅ Python virtual environment exists"
fi

# Check if node_modules exists for frontend
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
else
    echo "✅ Frontend dependencies installed"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  1. Backend (in terminal 1):"
echo "     cd backend"
echo "     source venv/bin/activate"
echo "     uvicorn app.main:app --reload --port 8000"
echo ""
echo "  2. Frontend (in terminal 2):"
echo "     cd frontend"
echo "     npm run dev"
echo ""
echo "  3. Access the app at http://localhost:3000"
echo ""
echo "To stop PostgreSQL: docker-compose down"
echo ""
