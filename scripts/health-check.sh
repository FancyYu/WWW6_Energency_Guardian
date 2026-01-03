#!/bin/bash

# Emergency Guardian System Health Check Script

echo "🏥 Emergency Guardian System Health Check"
echo "========================================"

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    if curl -f -s --max-time $timeout "$url" > /dev/null 2>&1; then
        echo "✅ $name is healthy"
        return 0
    else
        echo "❌ $name is not responding"
        return 1
    fi
}

# Function to check port
check_port() {
    local name=$1
    local port=$2
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "✅ $name port $port is open"
        return 0
    else
        echo "❌ $name port $port is not accessible"
        return 1
    fi
}

# Check infrastructure services
echo ""
echo "🔧 Infrastructure Services"
echo "-------------------------"
check_port "Redis" 6379
check_port "PostgreSQL" 5432
check_port "IPFS API" 5001
check_service "IPFS Gateway" "http://localhost:8080"

# Check application services
echo ""
echo "🚀 Application Services"
echo "----------------------"
check_service "Frontend" "http://localhost:3000"
check_service "Backend" "http://localhost:3001/health"
check_service "AI Agents" "http://localhost:8001/health"
check_service "Storage Service" "http://localhost:8002/health"

# Check production services (if running)
echo ""
echo "🏭 Production Services"
echo "--------------------"
if check_port "Nginx" 80; then
    check_service "Main App (Nginx)" "http://localhost/health"
fi

if check_port "Prometheus" 9090; then
    check_service "Prometheus" "http://localhost:9090"
fi

if check_port "Grafana" 3001; then
    check_service "Grafana" "http://localhost:3001"
fi

# Summary
echo ""
echo "📊 Health Check Complete"
echo "======================="

# Check Docker containers
echo ""
echo "🐳 Docker Container Status"
echo "-------------------------"
if command -v docker > /dev/null 2>&1; then
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep guardian || echo "No Guardian containers running"
else
    echo "Docker not available"
fi

echo ""
echo "💡 Tips:"
echo "- Use './scripts/start-system.sh dev' to start development environment"
echo "- Use './scripts/start-system.sh logs' to view service logs"
echo "- Use './scripts/start-system.sh status' to check container status"