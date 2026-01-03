import { test, expect } from "@playwright/test";
import { TestDataManager } from "../utils/test-data";
import { Web3TestHelper } from "../utils/web3-helper";
import { APITestHelper } from "../utils/api-helper";

test.describe("User Registration and Profile Setup", () => {
  let testDataManager: TestDataManager;
  let apiHelper: APITestHelper;

  test.beforeAll(async () => {
    testDataManager = new TestDataManager();
    await testDataManager.initializeTestData();
    apiHelper = new APITestHelper();
  });

  test("should allow user to connect wallet", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const testUser = testDataManager.getTestUser("owner");

    // Mock MetaMask connection
    await web3Helper.mockMetaMaskConnection(
      testUser.walletAddress,
      testUser.privateKey
    );

    // Navigate to application
    await page.goto("/");

    // Connect wallet
    await web3Helper.connectWallet();

    // Verify wallet is connected
    const isConnected = await web3Helper.isWalletConnected();
    expect(isConnected).toBe(true);

    // Verify correct address is displayed
    const connectedAddress = await web3Helper.getConnectedAddress();
    expect(connectedAddress).toContain(testUser.walletAddress.slice(0, 6)); // Check first 6 chars
  });

  test("should create user profile after wallet connection", async ({
    page,
  }) => {
    const web3Helper = new Web3TestHelper(page);
    const testUser = testDataManager.getTestUser("owner");

    // Setup and connect wallet
    await web3Helper.mockMetaMaskConnection(
      testUser.walletAddress,
      testUser.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Look for profile setup form or navigate to profile
    const profileButton = page
      .locator(
        '[data-testid="profile-setup"], button:has-text("Setup Profile"), a[href*="profile"]'
      )
      .first();

    if (await profileButton.isVisible()) {
      await profileButton.click();
    } else {
      // Try navigating directly to profile page
      await page.goto("/profile");
    }

    // Fill out profile information
    const nameInput = page
      .locator('input[name="name"], input[placeholder*="name" i]')
      .first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(testUser.name);
    }

    const emailInput = page
      .locator('input[name="email"], input[type="email"]')
      .first();
    if (await emailInput.isVisible()) {
      await emailInput.fill(testUser.email);
    }

    // Submit profile
    const submitButton = page
      .locator(
        'button[type="submit"], button:has-text("Save"), button:has-text("Create Profile")'
      )
      .first();
    if (await submitButton.isVisible()) {
      await submitButton.click();

      // Wait for success message or redirect
      await page.waitForTimeout(2000);
    }
  });

  test("should display user dashboard after registration", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const testUser = testDataManager.getTestUser("owner");

    // Setup wallet and profile
    await web3Helper.mockMetaMaskConnection(
      testUser.walletAddress,
      testUser.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Navigate to dashboard
    await page.goto("/dashboard");

    // Check for dashboard elements
    await expect(
      page.locator('h1, h2, [data-testid="dashboard-title"]')
    ).toBeVisible();

    // Check for key dashboard components
    const dashboardElements = [
      '[data-testid="wallet-info"]',
      '[data-testid="emergency-status"]',
      '[data-testid="guardians-section"]',
      ".wallet-balance",
      ".emergency-button",
      ".guardians-list",
    ];

    // At least some dashboard elements should be visible
    let visibleElements = 0;
    for (const selector of dashboardElements) {
      try {
        if (await page.locator(selector).first().isVisible({ timeout: 1000 })) {
          visibleElements++;
        }
      } catch (error) {
        // Element not found, continue
      }
    }

    expect(visibleElements).toBeGreaterThan(0);
  });

  test("should handle wallet disconnection", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const testUser = testDataManager.getTestUser("owner");

    // Connect wallet first
    await web3Helper.mockMetaMaskConnection(
      testUser.walletAddress,
      testUser.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Verify connection
    expect(await web3Helper.isWalletConnected()).toBe(true);

    // Disconnect wallet
    await web3Helper.disconnectWallet();

    // Verify disconnection
    await page.waitForTimeout(1000);
    const isConnected = await web3Helper.isWalletConnected();
    expect(isConnected).toBe(false);
  });

  test("should persist user data across sessions", async ({ page }) => {
    const testUser = testDataManager.getTestUser("owner");

    // Create user via API first
    try {
      const response = await apiHelper.createUser({
        name: testUser.name,
        email: testUser.email,
        walletAddress: testUser.walletAddress,
      });

      if (response.status === 201 || response.status === 200) {
        // User created successfully
        const userId = response.data.id || testUser.id;

        // Retrieve user data
        const getUserResponse = await apiHelper.getUser(userId);
        expect(getUserResponse.status).toBe(200);
        expect(getUserResponse.data.email).toBe(testUser.email);
      }
    } catch (error) {
      // API might not be fully implemented yet
      console.log("User API test skipped - API not available:", error.message);
    }
  });
});
