import { chromium, FullConfig } from "@playwright/test";
import { SystemHealthChecker } from "./utils/system-health";
import { TestDataManager } from "./utils/test-data";

async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting Emergency Guardian E2E Test Suite");

  // Wait for system to be ready
  const healthChecker = new SystemHealthChecker();
  console.log("⏳ Waiting for system health check...");

  const maxRetries = 30; // 5 minutes with 10s intervals
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const isHealthy = await healthChecker.checkAllServices();
      if (isHealthy) {
        console.log("✅ All services are healthy and ready");
        break;
      }
    } catch (error) {
      console.log(
        `⚠️  Health check attempt ${retries + 1}/${maxRetries} failed:`,
        error.message
      );
    }

    retries++;
    if (retries >= maxRetries) {
      throw new Error(
        "❌ System failed to become healthy within timeout period"
      );
    }

    console.log(
      `⏳ Retrying health check in 10 seconds... (${retries}/${maxRetries})`
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }

  // Initialize test data
  console.log("📊 Initializing test data...");
  const testDataManager = new TestDataManager();
  await testDataManager.initializeTestData();

  // Setup browser context for Web3 testing
  console.log("🌐 Setting up Web3 test environment...");
  const browser = await chromium.launch();
  const context = await browser.newContext();

  // Install MetaMask extension or setup Web3 provider
  // This would be done in a real implementation

  await browser.close();

  console.log("✅ Global setup completed successfully");
}

export default globalSetup;
