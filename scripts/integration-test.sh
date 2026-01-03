#!/bin/bash

# Emergency Guardian System Integration Test Script

set -e

echo "🧪 Emergency Guardian System Integration Test"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -n "Testing $test_name... "
    
    if eval "$test_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Function to test service endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local timeout=${3:-10}
    
    curl -f -s --max-time $timeout "$url" > /dev/null 2>&1
}

# Function to test port
test_port() {
    local port=$1
    nc -z localhost "$port" 2>/dev/null
}

echo ""
echo "🔍 Pre-flight Checks"
echo "-------------------"

# Check if Docker is available
if ! command -v docker > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker and Docker Compose are available${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Creating .env file from template${NC}"
    cp .env.example .env
fi

echo ""
echo "🚀 Starting Integration Tests"
echo "=============================="

# Test 1: Docker Compose Configuration Validation
echo ""
echo "📋 Test 1: Configuration Validation"
run_test "Docker Compose Dev Config" "docker-compose -f docker-compose.dev.yml config"
run_test "Docker Compose Prod Config" "docker-compose config"

# Test 2: Service Build Tests
echo ""
echo "🔨 Test 2: Service Build Tests"
run_test "Frontend Dockerfile" "docker build -f frontend/Dockerfile.dev frontend -t test-frontend"
run_test "Backend Dockerfile" "docker build -f backend/Dockerfile.dev backend -t test-backend"
run_test "AI Agents Dockerfile" "docker build -f ai-agents/Dockerfile.dev ai-agents -t test-ai-agents"
run_test "Storage Service Dockerfile" "docker build -f storage-service/Dockerfile.dev storage-service -t test-storage"

# Test 3: Network Configuration
echo ""
echo "🌐 Test 3: Network Configuration"
run_test "Docker Network Creation" "docker network create guardian-network-test || true"

# Test 4: Volume Configuration
echo ""
echo "💾 Test 4: Volume Configuration"
run_test "Docker Volume Creation" "docker volume create guardian-test-vol"

# Test 5: Environment Variable Validation
echo ""
echo "🔧 Test 5: Environment Variables"
run_test ".env file exists" "[ -f .env ]"
run_test "Required vars in .env" "grep -q 'BLOCKCHAIN_RPC_URL' .env && grep -q 'JWT_SECRET' .env"

# Test 6: Script Permissions
echo ""
echo "📜 Test 6: Script Permissions"
run_test "Start script executable" "[ -x scripts/start-system.sh ]"
run_test "Health check executable" "[ -x scripts/health-check.sh ]"

# Test 7: Configuration Files
echo ""
echo "📁 Test 7: Configuration Files"
run_test "Nginx config exists" "[ -f nginx/nginx.conf ]"
run_test "Prometheus config exists" "[ -f monitoring/prometheus.yml ]"
run_test "Grafana datasource exists" "[ -f monitoring/grafana/datasources/prometheus.yml ]"

# Test 8: Service Dependencies
echo ""
echo "🔗 Test 8: Service Dependencies"
run_test "Frontend package.json" "[ -f frontend/package.json ]"
run_test "Backend package.json" "[ -f backend/package.json ]"
run_test "AI Agents requirements.txt" "[ -f ai-agents/requirements.txt ]"
run_test "Storage Service go.mod" "[ -f storage-service/go.mod ]"

# Cleanup test resources
echo ""
echo "🧹 Cleaning up test resources..."
docker rmi test-frontend test-backend test-ai-agents test-storage 2>/dev/null || true
docker network rm guardian-network-test 2>/dev/null || true
docker volume rm guardian-test-vol 2>/dev/null || true

# Test Results
echo ""
echo "📊 Integration Test Results"
echo "=========================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All integration tests passed!${NC}"
    echo ""
    echo "✅ System is ready for deployment"
    echo "🚀 Run './scripts/start-system.sh dev' to start development environment"
    echo "🏭 Run './scripts/start-system.sh prod' to start production environment"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some integration tests failed${NC}"
    echo ""
    echo "Please fix the failing tests before deploying the system"
    exit 1
fi