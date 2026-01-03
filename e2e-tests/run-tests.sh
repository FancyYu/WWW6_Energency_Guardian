#!/bin/bash

# Emergency Guardian E2E Test Runner
# This script manages the complete E2E testing process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
E2E_DIR="$PROJECT_ROOT/e2e-tests"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
HEALTH_CHECK_SCRIPT="$PROJECT_ROOT/scripts/health-check.sh"
MAX_WAIT_TIME=300 # 5 minutes
HEALTH_CHECK_INTERVAL=10

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed or not in PATH"
        exit 1
    fi
    
    log_success "All prerequisites are available"
}

# Install dependencies
install_dependencies() {
    log_info "Installing E2E test dependencies..."
    
    cd "$E2E_DIR"
    
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Install Playwright browsers if not already installed
    if [ ! -d "node_modules/@playwright/test" ]; then
        log_error "Playwright not installed. Run 'npm install' first."
        exit 1
    fi
    
    # Check if browsers are installed
    if ! npx playwright --version &> /dev/null; then
        log_info "Installing Playwright browsers..."
        npx playwright install
    fi
    
    log_success "Dependencies installed"
}

# Start the system
start_system() {
    log_info "Starting Emergency Guardian system..."
    
    cd "$PROJECT_ROOT"
    
    # Stop any existing containers
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans 2>/dev/null || true
    
    # Start the system
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build
    
    log_success "System containers started"
}

# Wait for system to be healthy
wait_for_system() {
    log_info "Waiting for system to become healthy..."
    
    local elapsed=0
    local healthy=false
    
    while [ $elapsed -lt $MAX_WAIT_TIME ]; do
        if [ -x "$HEALTH_CHECK_SCRIPT" ]; then
            if "$HEALTH_CHECK_SCRIPT" --quiet; then
                healthy=true
                break
            fi
        else {
            # Fallback health check
            if curl -s http://localhost:3000 > /dev/null && \
               curl -s http://localhost:3001/health > /dev/null && \
               curl -s http://localhost:8001/health > /dev/null && \
               curl -s http://localhost:8002/health > /dev/null; then
                healthy=true
                break
            fi
        fi
        
        log_info "System not ready yet. Waiting... ($elapsed/${MAX_WAIT_TIME}s)"
        sleep $HEALTH_CHECK_INTERVAL
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done
    
    if [ "$healthy" = true ]; then
        log_success "System is healthy and ready for testing"
    else
        log_error "System failed to become healthy within ${MAX_WAIT_TIME} seconds"
        show_system_logs
        exit 1
    fi
}

# Show system logs for debugging
show_system_logs() {
    log_warning "Showing system logs for debugging..."
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=50
}

# Run the tests
run_tests() {
    log_info "Running E2E tests..."
    
    cd "$E2E_DIR"
    
    local test_command="npx playwright test"
    local test_args=""
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --headed)
                test_args="$test_args --headed"
                shift
                ;;
            --debug)
                test_args="$test_args --debug"
                shift
                ;;
            --ui)
                test_args="$test_args --ui"
                shift
                ;;
            --project=*)
                test_args="$test_args --project=${1#*=}"
                shift
                ;;
            --grep=*)
                test_args="$test_args --grep=${1#*=}"
                shift
                ;;
            --reporter=*)
                test_args="$test_args --reporter=${1#*=}"
                shift
                ;;
            *)
                test_args="$test_args $1"
                shift
                ;;
        esac
    done
    
    # Run tests
    if $test_command $test_args; then
        log_success "All tests passed!"
        return 0
    else
        log_error "Some tests failed"
        return 1
    fi
}

# Generate test report
generate_report() {
    log_info "Generating test report..."
    
    cd "$E2E_DIR"
    
    if [ -d "playwright-report" ]; then
        log_info "Test report available at: file://$E2E_DIR/playwright-report/index.html"
        
        # Try to open report in browser (macOS)
        if command -v open &> /dev/null; then
            open "playwright-report/index.html" 2>/dev/null || true
        fi
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    
    cd "$PROJECT_ROOT"
    
    if [ "$KEEP_SYSTEM_RUNNING" != "true" ]; then
        log_info "Stopping system containers..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
        log_success "System stopped"
    else
        log_info "Keeping system running (KEEP_SYSTEM_RUNNING=true)"
    fi
}

# Main execution
main() {
    log_info "Starting Emergency Guardian E2E Test Suite"
    log_info "Project root: $PROJECT_ROOT"
    
    # Set up cleanup trap
    trap cleanup EXIT
    
    # Check if system should be managed by this script
    if [ "$SKIP_SYSTEM_START" != "true" ]; then
        check_prerequisites
        install_dependencies
        start_system
        wait_for_system
    else
        log_info "Skipping system startup (SKIP_SYSTEM_START=true)"
        install_dependencies
    fi
    
    # Run tests
    local test_result=0
    if run_tests "$@"; then
        log_success "E2E tests completed successfully!"
    else
        log_error "E2E tests failed!"
        test_result=1
    fi
    
    # Generate report
    generate_report
    
    # Show final status
    if [ $test_result -eq 0 ]; then
        log_success "🎉 All tests passed! System is working correctly."
    else
        log_error "❌ Some tests failed. Check the report for details."
    fi
    
    exit $test_result
}

# Help function
show_help() {
    cat << EOF
Emergency Guardian E2E Test Runner

Usage: $0 [OPTIONS] [TEST_ARGS]

OPTIONS:
    --help              Show this help message
    --headed            Run tests in headed mode (visible browser)
    --debug             Run tests in debug mode
    --ui                Run tests with Playwright UI
    --project=NAME      Run tests for specific project (chromium, firefox, webkit)
    --grep=PATTERN      Run tests matching pattern
    --reporter=TYPE     Use specific reporter (html, json, junit)

ENVIRONMENT VARIABLES:
    SKIP_SYSTEM_START=true      Skip starting the system (assume it's already running)
    KEEP_SYSTEM_RUNNING=true    Don't stop the system after tests
    MAX_WAIT_TIME=300          Maximum time to wait for system startup (seconds)

EXAMPLES:
    $0                          # Run all tests with system management
    $0 --headed                 # Run tests with visible browser
    $0 --project=chromium       # Run tests only on Chromium
    $0 --grep="health"          # Run only health-related tests
    
    SKIP_SYSTEM_START=true $0   # Run tests with system already running
    KEEP_SYSTEM_RUNNING=true $0 # Keep system running after tests

EOF
}

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# Run main function with all arguments
main "$@"