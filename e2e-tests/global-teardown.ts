import { FullConfig } from "@playwright/test";
import { TestDataManager } from "./utils/test-data";

async function globalTeardown(config: FullConfig) {
  console.log("🧹 Starting Emergency Guardian E2E Test Cleanup");

  try {
    // Clean up test data
    console.log("📊 Cleaning up test data...");
    const testDataManager = new TestDataManager();
    await testDataManager.cleanupTestData();

    // Generate test report summary
    console.log("📋 Generating test report summary...");
    // This would generate a summary of all test results

    console.log("✅ Global teardown completed successfully");
  } catch (error) {
    console.error("❌ Error during global teardown:", error);
    // Don't throw here to avoid masking test failures
  }
}

export default globalTeardown;
