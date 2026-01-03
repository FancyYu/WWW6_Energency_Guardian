#!/bin/bash

# Emergency Guardian System Startup Script

set -e

echo "🚀 Starting Emergency Guardian System..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env file with your configuration"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Function to start development environment
start_dev() {
    echo "🔧 Starting development environment..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.dev.yml up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 30
    
    echo "✅ Development environment started!"
    echo "📱 Frontend: http://localhost:3000"
    echo "🔧 Backend API: http://localhost:3001"
    echo "🤖 AI Agents: http://localhost:8001"
    echo "💾 Storage Service: http://localhost:8002"
}

# Function to start production environment
start_prod() {
    echo "🏭 Starting production environment..."
    docker-compose down
    docker-compose up --build -d
    
    echo "⏳ Waiting for services to be ready..."
    sleep 60
    
    echo "✅ Production environment started!"
    echo "🌐 Main Application: http://localhost"
    echo "📊 Monitoring: http://localhost:3001"
}

# Function to stop all services
stop_system() {
    echo "🛑 Stopping Emergency Guardian System..."
    docker-compose -f docker-compose.dev.yml down
    docker-compose down
    echo "✅ System stopped"
}

# Main script logic
case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_system
        ;;
    "logs")
        if [ "$2" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml logs -f
        else
            docker-compose logs -f
        fi
        ;;
    "status")
        if [ "$2" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml ps
        else
            docker-compose ps
        fi
        ;;
    *)
        echo "Usage: $0 {dev|prod|stop|logs|status}"
        echo ""
        echo "Commands:"
        echo "  dev     - Start development environment"
        echo "  prod    - Start production environment"
        echo "  stop    - Stop all services"
        echo "  logs    - Show logs"
        echo "  status  - Show service status"
        exit 1
        ;;
esac