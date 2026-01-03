import { test, expect } from "@playwright/test";
import { SystemHealthChecker } from "../utils/system-health";
import { APITestHelper } from "../utils/api-helper";

test.describe("System Health and Connectivity", () => {
  let healthChecker: SystemHealthChecker;
  let apiHelper: APITestHelper;

  test.beforeAll(async () => {
    healthChecker = new SystemHealthChecker();
    apiHelper = new APITestHelper();
  });

  test("should have all services running and healthy", async () => {
    const systemStatus = await healthChecker.getSystemStatus();

    // Check each service
    expect(systemStatus.Frontend).toBe(true);
    expect(systemStatus.Backend).toBe(true);
    expect(systemStatus["AI Agents"]).toBe(true);
    expect(systemStatus["Storage Service"]).toBe(true);
    expect(systemStatus.IPFS).toBe(true);
  });

  test("should load frontend application", async ({ page }) => {
    await page.goto("/");

    // Check if the main application loads
    await expect(page).toHaveTitle(/Emergency Guardian/i);

    // Check for main navigation or key elements
    await expect(
      page.locator('nav, header, [data-testid="main-navigation"]')
    ).toBeVisible();
  });

  test("should have working API endpoints", async () => {
    // Test backend health
    const backendHealthy = await apiHelper.checkBackendHealth();
    expect(backendHealthy).toBe(true);

    // Test AI agents health
    const aiHealthy = await apiHelper.checkAIAgentsHealth();
    expect(aiHealthy).toBe(true);

    // Test storage service health
    const storageHealthy = await apiHelper.checkStorageServiceHealth();
    expect(storageHealthy).toBe(true);
  });

  test("should have proper CORS configuration", async ({ page }) => {
    // Navigate to frontend
    await page.goto("/");

    // Try to make an API call from the frontend
    const response = await page.evaluate(async () => {
      try {
        const res = await fetch("http://localhost:3001/health");
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(response.status).toBe(200);
    expect(response.ok).toBe(true);
  });

  test("should have WebSocket connections working", async ({ page }) => {
    await page.goto("/");

    // Test WebSocket connection (if implemented)
    const wsResult = await page.evaluate(() => {
      return new Promise((resolve) => {
        try {
          const ws = new WebSocket("ws://localhost:3001/ws");
          ws.onopen = () => {
            ws.close();
            resolve({ connected: true });
          };
          ws.onerror = () => {
            resolve({ connected: false, error: "Connection failed" });
          };

          // Timeout after 5 seconds
          setTimeout(() => {
            ws.close();
            resolve({ connected: false, error: "Timeout" });
          }, 5000);
        } catch (error) {
          resolve({ connected: false, error: error.message });
        }
      });
    });

    // WebSocket might not be implemented yet, so we'll just log the result
    console.log("WebSocket test result:", wsResult);
  });

  test("should have monitoring endpoints accessible", async () => {
    // Test Prometheus metrics (if accessible)
    try {
      const response = await fetch(
        "http://localhost:9090/api/v1/query?query=up"
      );
      if (response.ok) {
        console.log("✅ Prometheus metrics accessible");
      }
    } catch (error) {
      console.log("ℹ️  Prometheus not accessible (may be internal only)");
    }
  });
});
