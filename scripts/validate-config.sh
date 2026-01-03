#!/bin/bash

# Emergency Guardian System Configuration Validation Script

echo "🔍 Emergency Guardian System Configuration Validation"
echo "===================================================="

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
    
    echo -n "Checking $test_name... "
    
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

echo ""
echo "📁 File Structure Validation"
echo "---------------------------"

# Check main configuration files
run_test "Docker Compose (prod)" "[ -f docker-compose.yml ]"
run_test "Docker Compose (dev)" "[ -f docker-compose.dev.yml ]"
run_test "Environment template" "[ -f .env.example ]"
run_test "Integration guide" "[ -f INTEGRATION_GUIDE.md ]"
run_test "Makefile" "[ -f Makefile ]"

echo ""
echo "🐳 Docker Configuration Files"
echo "----------------------------"

# Check Dockerfiles
run_test "Frontend Dockerfile" "[ -f frontend/Dockerfile ]"
run_test "Frontend Dev Dockerfile" "[ -f frontend/Dockerfile.dev ]"
run_test "Backend Dockerfile" "[ -f backend/Dockerfile ]"
run_test "Backend Dev Dockerfile" "[ -f backend/Dockerfile.dev ]"
run_test "AI Agents Dockerfile" "[ -f ai-agents/Dockerfile ]"
run_test "AI Agents Dev Dockerfile" "[ -f ai-agents/Dockerfile.dev ]"
run_test "Storage Service Dockerfile" "[ -f storage-service/Dockerfile ]"
run_test "Storage Service Dev Dockerfile" "[ -f storage-service/Dockerfile.dev ]"

echo ""
echo "🌐 Nginx Configuration"
echo "---------------------"

run_test "Nginx main config" "[ -f nginx/nginx.conf ]"
run_test "API Gateway config" "[ -f nginx/conf.d/api-gateway.conf ]"
run_test "Frontend nginx config" "[ -f frontend/nginx.conf ]"

echo ""
echo "📊 Monitoring Configuration"
echo "--------------------------"

run_test "Prometheus config" "[ -f monitoring/prometheus.yml ]"
run_test "Grafana datasource" "[ -f monitoring/grafana/datasources/prometheus.yml ]"
run_test "Grafana dashboard config" "[ -f monitoring/grafana/dashboards/dashboard.yml ]"

echo ""
echo "📜 Scripts and Tools"
echo "------------------"

run_test "Start system script" "[ -f scripts/start-system.sh ]"
run_test "Health check script" "[ -f scripts/health-check.sh ]"
run_test "Integration test script" "[ -f scripts/integration-test.sh ]"
run_test "Config validation script" "[ -f scripts/validate-config.sh ]"

# Check script permissions
run_test "Start script executable" "[ -x scripts/start-system.sh ]"
run_test "Health check executable" "[ -x scripts/health-check.sh ]"
run_test "Integration test executable" "[ -x scripts/integration-test.sh ]"
run_test "Config validation executable" "[ -x scripts/validate-config.sh ]"

echo ""
echo "🔧 Service Dependencies"
echo "----------------------"

# Check service configuration files
run_test "Frontend package.json" "[ -f frontend/package.json ]"
run_test "Backend package.json" "[ -f backend/package.json ]"
run_test "AI Agents requirements.txt" "[ -f ai-agents/requirements.txt ]"
run_test "Storage Service go.mod" "[ -f storage-service/go.mod ]"

echo ""
echo "📋 Configuration Content Validation"
echo "----------------------------------"

# Check if .env.example has required variables
if [ -f .env.example ]; then
    run_test "BLOCKCHAIN_RPC_URL in .env.example" "grep -q 'BLOCKCHAIN_RPC_URL' .env.example"
    run_test "JWT_SECRET in .env.example" "grep -q 'JWT_SECRET' .env.example"
    run_test "GEMINI_API_KEY in .env.example" "grep -q 'GEMINI_API_KEY' .env.example"
    run_test "DATABASE_URL in .env.example" "grep -q 'DATABASE_URL' .env.example"
fi

# Check docker-compose.yml structure
if [ -f docker-compose.yml ]; then
    run_test "Redis service in compose" "grep -q 'redis:' docker-compose.yml"
    run_test "PostgreSQL service in compose" "grep -q 'postgres:' docker-compose.yml"
    run_test "Frontend service in compose" "grep -q 'frontend:' docker-compose.yml"
    run_test "Backend service in compose" "grep -q 'backend:' docker-compose.yml"
    run_test "AI Agents service in compose" "grep -q 'ai-agents:' docker-compose.yml"
    run_test "Storage service in compose" "grep -q 'storage-service:' docker-compose.yml"
fi

echo ""
echo "🔗 Service Integration Points"
echo "----------------------------"

# Check for service integration configurations
run_test "Backend API routes configured" "grep -q '/api/' nginx/conf.d/api-gateway.conf"
run_test "AI Agents routes configured" "grep -q '/ai/' nginx/conf.d/api-gateway.conf"
run_test "Storage routes configured" "grep -q '/storage/' nginx/conf.d/api-gateway.conf"

echo ""
echo "📊 Validation Results"
echo "===================="
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All configuration validations passed!${NC}"
    echo ""
    echo "✅ System configuration is complete and ready"
    echo "🚀 Next steps:"
    echo "   1. Update .env file with your configuration"
    echo "   2. Run './scripts/start-system.sh dev' to start development"
    echo "   3. Run './scripts/health-check.sh' to verify services"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Some configuration validations failed${NC}"
    echo ""
    echo "Please fix the missing files or configurations"
    exit 1
fi