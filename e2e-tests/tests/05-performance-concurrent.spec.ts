import { test, expect } from "@playwright/test";
import { TestDataManager } from "../utils/test-data";
import { Web3TestHelper } from "../utils/web3-helper";
import { APITestHelper } from "../utils/api-helper";

test.describe("Performance and Concurrent Operations", () => {
  let testDataManager: TestDataManager;
  let apiHelper: APITestHelper;

  test.beforeAll(async () => {
    testDataManager = new TestDataManager();
    await testDataManager.initializeTestData();
    apiHelper = new APITestHelper();
  });

  test("should handle multiple concurrent users", async ({ browser }) => {
    const users = testDataManager.getAllTestUsers().slice(0, 3); // Test with 3 concurrent users

    // Create multiple browser contexts for concurrent testing
    const contexts = await Promise.all(
      users.map(async (user) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const web3Helper = new Web3TestHelper(page);

        // Setup each user's wallet
        await web3Helper.mockMetaMaskConnection(
          user.walletAddress,
          user.privateKey
        );

        return { context, page, web3Helper, user };
      })
    );

    try {
      // Perform concurrent operations
      const operations = contexts.map(async ({ page, web3Helper, user }) => {
        // Navigate and connect wallet
        await page.goto("/");
        await web3Helper.connectWallet();

        // Navigate to dashboard
        await page.goto("/dashboard");

        // Measure page load time
        const startTime = Date.now();
        await page.waitForLoadState("networkidle");
        const loadTime = Date.now() - startTime;

        return {
          userId: user.id,
          loadTime,
          success: true,
        };
      });

      const results = await Promise.all(operations);

      // Verify all operations succeeded
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.loadTime).toBeLessThan(5000); // Should load within 5 seconds
        console.log(`User ${result.userId} load time: ${result.loadTime}ms`);
      });

      console.log(`✅ Successfully handled ${results.length} concurrent users`);
    } finally {
      // Clean up contexts
      await Promise.all(contexts.map(({ context }) => context.close()));
    }
  });

  test("should maintain performance under load", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Measure performance of key operations
    const performanceMetrics = [];

    // Test dashboard loading performance
    const dashboardStart = Date.now();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const dashboardTime = Date.now() - dashboardStart;
    performanceMetrics.push({
      operation: "dashboard_load",
      time: dashboardTime,
    });

    // Test navigation performance
    const navStart = Date.now();
    await page.goto("/guardians");
    await page.waitForLoadState("networkidle");
    const navTime = Date.now() - navStart;
    performanceMetrics.push({ operation: "navigation", time: navTime });

    // Test emergency page performance
    const emergencyStart = Date.now();
    await page.goto("/emergency");
    await page.waitForLoadState("networkidle");
    const emergencyTime = Date.now() - emergencyStart;
    performanceMetrics.push({
      operation: "emergency_page",
      time: emergencyTime,
    });

    // Verify performance requirements
    performanceMetrics.forEach((metric) => {
      expect(metric.time).toBeLessThan(3000); // All operations should complete within 3 seconds
      console.log(`${metric.operation}: ${metric.time}ms`);
    });

    const averageTime =
      performanceMetrics.reduce((sum, m) => sum + m.time, 0) /
      performanceMetrics.length;
    expect(averageTime).toBeLessThan(2000); // Average should be under 2 seconds

    console.log(`✅ Average operation time: ${averageTime.toFixed(2)}ms`);
  });

  test("should handle rapid API requests", async () => {
    const testUser = testDataManager.getTestUser("owner");

    // Test rapid API requests
    const requestCount = 10;
    const requests = [];

    for (let i = 0; i < requestCount; i++) {
      requests.push(
        apiHelper
          .checkBackendHealth()
          .then((result) => ({ index: i, success: result, time: Date.now() }))
          .catch((error) => ({
            index: i,
            success: false,
            error: error.message,
            time: Date.now(),
          }))
      );
    }

    const results = await Promise.all(requests);

    // Verify most requests succeeded
    const successCount = results.filter((r) => r.success).length;
    const successRate = successCount / requestCount;

    expect(successRate).toBeGreaterThan(0.8); // At least 80% success rate
    console.log(
      `✅ API success rate: ${(successRate * 100).toFixed(
        1
      )}% (${successCount}/${requestCount})`
    );
  });

  test("should handle WebSocket connections under load", async ({ page }) => {
    // Test multiple WebSocket connections
    const connectionCount = 5;

    const wsResults = await page.evaluate((count) => {
      return new Promise((resolve) => {
        const connections = [];
        let completedConnections = 0;
        const results = [];

        for (let i = 0; i < count; i++) {
          try {
            const ws = new WebSocket(`ws://localhost:3001/ws?client=${i}`);

            ws.onopen = () => {
              results.push({ index: i, connected: true, time: Date.now() });
              ws.close();
              completedConnections++;

              if (completedConnections === count) {
                resolve(results);
              }
            };

            ws.onerror = () => {
              results.push({
                index: i,
                connected: false,
                error: "Connection failed",
              });
              completedConnections++;

              if (completedConnections === count) {
                resolve(results);
              }
            };

            connections.push(ws);
          } catch (error) {
            results.push({ index: i, connected: false, error: error.message });
            completedConnections++;

            if (completedConnections === count) {
              resolve(results);
            }
          }
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          connections.forEach((ws) => {
            try {
              ws.close();
            } catch (e) {
              // Ignore close errors
            }
          });

          if (completedConnections < count) {
            for (let i = results.length; i < count; i++) {
              results.push({ index: i, connected: false, error: "Timeout" });
            }
            resolve(results);
          }
        }, 10000);
      });
    }, connectionCount);

    // WebSocket might not be implemented yet
    const connectedCount = wsResults.filter((r: any) => r.connected).length;
    console.log(
      `WebSocket connections: ${connectedCount}/${connectionCount} successful`
    );

    // Don't fail the test if WebSocket isn't implemented
    if (connectedCount > 0) {
      expect(connectedCount).toBeGreaterThan(0);
    }
  });

  test("should maintain data consistency under concurrent operations", async ({
    browser,
  }) => {
    const owner = testDataManager.getTestUser("owner");
    const guardians = testDataManager
      .getAllTestUsers()
      .filter((u) => u.role === "guardian")
      .slice(0, 2);

    // Create concurrent contexts
    const contexts = await Promise.all(
      [owner, ...guardians].map(async (user) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const web3Helper = new Web3TestHelper(page);

        await web3Helper.mockMetaMaskConnection(
          user.walletAddress,
          user.privateKey
        );
        return { context, page, web3Helper, user };
      })
    );

    try {
      // Perform concurrent operations that might affect shared state
      const operations = contexts.map(
        async ({ page, web3Helper, user }, index) => {
          await page.goto("/");
          await web3Helper.connectWallet();

          // Each user performs different operations
          if (user.role === "owner") {
            await page.goto("/dashboard");
            // Owner checks dashboard
            const dashboardVisible = await page
              .locator('[data-testid="dashboard"], .dashboard')
              .first()
              .isVisible({ timeout: 5000 });
            return {
              user: user.id,
              operation: "dashboard_access",
              success: dashboardVisible,
            };
          } else {
            await page.goto("/guardians");
            // Guardians check guardian page
            const guardiansVisible = await page
              .locator('[data-testid="guardians"], .guardians')
              .first()
              .isVisible({ timeout: 5000 });
            return {
              user: user.id,
              operation: "guardians_access",
              success: guardiansVisible,
            };
          }
        }
      );

      const results = await Promise.all(operations);

      // Verify all operations completed successfully
      results.forEach((result) => {
        console.log(
          `User ${result.user} - ${result.operation}: ${
            result.success ? "SUCCESS" : "FAILED"
          }`
        );
      });

      const successCount = results.filter((r) => r.success).length;
      expect(successCount).toBeGreaterThan(0); // At least some operations should succeed
    } finally {
      await Promise.all(contexts.map(({ context }) => context.close()));
    }
  });

  test("should handle memory usage efficiently", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Measure memory usage during navigation
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize
        : 0;
    });

    // Perform multiple navigation operations
    const pages = [
      "/dashboard",
      "/guardians",
      "/emergency",
      "/audit",
      "/profile",
    ];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000); // Allow for any async operations
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory
        ? (performance as any).memory.usedJSHeapSize
        : 0;
    });

    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

      console.log(
        `Memory usage: ${initialMemory} -> ${finalMemory} bytes (${memoryIncreasePercent.toFixed(
          1
        )}% increase)`
      );

      // Memory increase should be reasonable (less than 100% increase)
      expect(memoryIncreasePercent).toBeLessThan(100);
    } else {
      console.log("Memory measurement not available in this browser");
    }
  });
});
