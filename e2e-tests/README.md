# Emergency Guardian E2E Tests

This directory contains end-to-end integration tests for the Emergency Guardian system using Playwright.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Emergency Guardian system running

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install-browsers
```

### Running Tests

```bash
# Run all tests (starts system automatically)
npm run test:full

# Run tests with system already running
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run specific test file
npx playwright test tests/01-system-health.spec.ts
```

### System Management

```bash
# Start system manually
npm run docker:up

# Stop system
npm run docker:down

# Check system status
../scripts/health-check.sh
```

## 📋 Test Structure

### Test Files

1. **01-system-health.spec.ts** - System connectivity and health checks
2. **02-user-registration.spec.ts** - User registration and wallet connection
3. **03-guardian-management.spec.ts** - Guardian addition, removal, and management
4. **04-emergency-flow.spec.ts** - Complete emergency workflow testing
5. **05-performance-concurrent.spec.ts** - Performance and concurrent user testing

### Test Categories

#### System Health Tests

- Service connectivity verification
- API endpoint availability
- CORS configuration validation
- WebSocket connection testing
- Monitoring system accessibility

#### User Management Tests

- Wallet connection and disconnection
- User profile creation and management
- Session persistence
- Authentication flows

#### Guardian Management Tests

- Guardian addition and removal
- Guardian list display and management
- Address validation
- Guardian limit enforcement
- API operations testing

#### Emergency Flow Tests

- Emergency situation triggering
- Status display and progress tracking
- Guardian notification system
- AI emergency analysis
- Multi-signature verification
- Payment execution
- Audit log generation
- Emergency cancellation

#### Performance Tests

- Concurrent user handling
- Load performance measurement
- Rapid API request handling
- WebSocket connection scaling
- Data consistency under load
- Memory usage efficiency

## 🔧 Configuration

### Environment Variables

The tests use the following default endpoints:

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- AI Agents: http://localhost:8001
- Storage Service: http://localhost:8002
- IPFS: http://localhost:5001

### Test Data

Tests use automatically generated test data including:

- Mock wallet addresses and private keys
- Test user profiles (owners, guardians, users)
- Emergency scenarios (medical, financial, security)
- Realistic test data for comprehensive testing

### Browser Configuration

Tests run on multiple browsers:

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)
- Mobile Safari (iPhone 12)

## 🧪 Test Utilities

### SystemHealthChecker

- Monitors all service health
- Provides service status reporting
- Handles service startup waiting

### TestDataManager

- Generates realistic test data
- Manages user accounts and scenarios
- Provides cleanup functionality

### Web3TestHelper

- Mocks MetaMask connections
- Handles wallet operations
- Manages Web3 interactions

### APITestHelper

- Provides API testing utilities
- Handles service communication
- Manages authentication

## 📊 Test Reports

### HTML Report

```bash
npm run test:report
```

### Test Results

- Results saved to `test-results/`
- Screenshots on failure
- Video recordings on failure
- Trace files for debugging

## 🚨 Troubleshooting

### Common Issues

1. **System Not Ready**

   ```bash
   # Check system health
   ../scripts/health-check.sh

   # Restart system
   npm run docker:down && npm run docker:up
   ```

2. **Port Conflicts**

   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :3001
   lsof -i :8001
   lsof -i :8002
   ```

3. **Browser Issues**

   ```bash
   # Reinstall browsers
   npm run install-browsers
   ```

4. **Test Failures**
   - Check test-results/ for screenshots and videos
   - Review HTML report for detailed failure information
   - Ensure system is fully started before running tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test in debug mode
npx playwright test tests/01-system-health.spec.ts --debug
```

## 🎯 Test Coverage

### Functional Coverage

- ✅ User registration and authentication
- ✅ Guardian management operations
- ✅ Emergency workflow end-to-end
- ✅ Multi-signature verification
- ✅ AI analysis integration
- ✅ Notification system
- ✅ Audit logging

### Technical Coverage

- ✅ API integration testing
- ✅ Web3 wallet integration
- ✅ Cross-service communication
- ✅ Performance under load
- ✅ Concurrent user scenarios
- ✅ Error handling and recovery

### Browser Coverage

- ✅ Desktop browsers (Chrome, Firefox, Safari)
- ✅ Mobile browsers (iOS Safari, Android Chrome)
- ✅ Responsive design validation

## 📈 Performance Benchmarks

### Expected Performance

- Page load time: < 3 seconds
- API response time: < 2 seconds
- Concurrent users: 10+ simultaneous
- Memory usage: < 100% increase during navigation

### Monitoring

- Real-time performance metrics
- Memory usage tracking
- API response time measurement
- Concurrent operation validation

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
- name: Run E2E Tests
  run: |
    cd e2e-tests
    npm install
    npm run install-browsers
    npm run test:full
```

### Test Artifacts

- Test results (JSON/XML)
- Screenshots and videos
- Performance metrics
- Coverage reports

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [Emergency Guardian System Architecture](../INTEGRATION_GUIDE.md)
- [API Documentation](../docs/api/)
- [Development Setup](../README.md)
