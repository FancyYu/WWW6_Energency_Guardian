# Emergency Guardian System Makefile

.PHONY: help dev prod stop logs status health clean build test

# Default target
help:
	@echo "Emergency Guardian System Commands"
	@echo "================================="
	@echo ""
	@echo "Development:"
	@echo "  make dev     - Start development environment"
	@echo "  make logs    - Show development logs"
	@echo "  make status  - Show development status"
	@echo ""
	@echo "Production:"
	@echo "  make prod    - Start production environment"
	@echo "  make logs-prod - Show production logs"
	@echo "  make status-prod - Show production status"
	@echo ""
	@echo "Utilities:"
	@echo "  make health  - Run health check"
	@echo "  make stop    - Stop all services"
	@echo "  make clean   - Clean Docker resources"
	@echo "  make build   - Build all services"
	@echo "  make test    - Run all tests"
	@echo ""
	@echo "Setup:"
	@echo "  make setup   - Initial setup"
	@echo "  make env     - Create .env file"

# Development commands
dev:
	@echo "🔧 Starting development environment..."
	docker-compose -f docker-compose.dev.yml up --build -d

logs:
	docker-compose -f docker-compose.dev.yml logs -f

status:
	docker-compose -f docker-compose.dev.yml ps

# Production commands
prod:
	@echo "🏭 Starting production environment..."
	docker-compose up --build -d

logs-prod:
	docker-compose logs -f

status-prod:
	docker-compose ps

# Utility commands
health:
	@./scripts/health-check.sh

stop:
	@echo "🛑 Stopping all services..."
	docker-compose -f docker-compose.dev.yml down
	docker-compose down

clean:
	@echo "🧹 Cleaning Docker resources..."
	docker-compose -f docker-compose.dev.yml down -v
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

build:
	@echo "🔨 Building all services..."
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose build --no-cache

# Test commands
test:
	@echo "🧪 Running all tests..."
	@echo "Testing smart contracts..."
	cd contracts && forge test
	@echo "Testing frontend..."
	cd frontend && npm test
	@echo "Testing AI agents..."
	cd ai-agents && python -m pytest
	@echo "Testing backend..."
	cd backend && npm test

test-contracts:
	cd contracts && forge test

test-frontend:
	cd frontend && npm test

test-ai:
	cd ai-agents && python -m pytest

test-backend:
	cd backend && npm test

# Setup commands
setup: env
	@echo "🚀 Setting up Emergency Guardian System..."
	@echo "Installing dependencies..."
	cd frontend && npm install
	cd backend && npm install
	cd ai-agents && pip install -r requirements.txt
	cd storage-service && go mod download
	@echo "✅ Setup complete!"

env:
	@if [ ! -f .env ]; then \
		echo "📋 Creating .env file..."; \
		cp .env.example .env; \
		echo "⚠️  Please update .env file with your configuration"; \
	else \
		echo "✅ .env file already exists"; \
	fi

# Docker shortcuts
restart-dev:
	make stop
	make dev

restart-prod:
	make stop
	make prod

# Individual service commands
frontend:
	docker-compose -f docker-compose.dev.yml up frontend --build

backend:
	docker-compose -f docker-compose.dev.yml up backend --build

ai-agents:
	docker-compose -f docker-compose.dev.yml up ai-agents --build

storage:
	docker-compose -f docker-compose.dev.yml up storage-service --build

# Database commands
db-migrate:
	docker exec -it guardian-backend-dev npm run migrate

db-reset:
	docker exec -it guardian-postgres-dev psql -U guardian -d emergency_guardian -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	make db-migrate

# Monitoring
monitor:
	@echo "📊 Opening monitoring dashboards..."
	@echo "Grafana: http://localhost:3001"
	@echo "Prometheus: http://localhost:9090"
	open http://localhost:3001 || xdg-open http://localhost:3001 || echo "Please open http://localhost:3001 manually"