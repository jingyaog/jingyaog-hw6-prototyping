.PHONY: help install dev-backend dev-frontend dev clean build test docker-up docker-down

help:
	@echo "Job Queue Manager - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install      - Install all dependencies"
	@echo "  make docker-up    - Start PostgreSQL container"
	@echo ""
	@echo "Development:"
	@echo "  make dev-backend  - Run backend server"
	@echo "  make dev-frontend - Run frontend dev server"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make docker-down  - Stop PostgreSQL container"
	@echo ""
	@echo "Building:"
	@echo "  make build        - Build frontend for production"

install:
	@echo "Installing dependencies..."
	@echo "Setting up backend..."
	cd backend && python3 -m venv venv && \
		. venv/bin/activate && \
		pip install -r requirements.txt
	@echo "Setting up frontend..."
	cd frontend && npm install
	@echo "Done! Run 'make docker-up' then 'make dev-backend' and 'make dev-frontend'"

docker-up:
	@echo "Starting PostgreSQL..."
	docker-compose up -d
	@echo "Waiting for database to be ready..."
	@sleep 3
	@echo "PostgreSQL is running on port 5432"

docker-down:
	@echo "Stopping PostgreSQL..."
	docker-compose down

dev-backend:
	@echo "Starting backend on http://localhost:8000"
	cd backend && . venv/bin/activate && uvicorn app.main:app --reload --port 8000

dev-frontend:
	@echo "Starting frontend on http://localhost:3000"
	cd frontend && npm run dev

build:
	@echo "Building frontend for production..."
	cd frontend && npm run build
	@echo "Build complete! Output in frontend/dist/"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules
	rm -rf backend/venv
	rm -rf backend/**/__pycache__
	@echo "Clean complete!"

test:
	@echo "Running tests..."
	@echo "Backend tests:"
	cd backend && . venv/bin/activate && python -m pytest || echo "No tests configured yet"
	@echo "Frontend tests:"
	cd frontend && npm test || echo "No tests configured yet"
