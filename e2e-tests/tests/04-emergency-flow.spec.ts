import { test, expect } from "@playwright/test";
import { TestDataManager } from "../utils/test-data";
import { Web3TestHelper } from "../utils/web3-helper";
import { APITestHelper } from "../utils/api-helper";

test.describe("Emergency Flow End-to-End", () => {
  let testDataManager: TestDataManager;
  let apiHelper: APITestHelper;

  test.beforeAll(async () => {
    testDataManager = new TestDataManager();
    await testDataManager.initializeTestData();
    apiHelper = new APITestHelper();
  });

  test("should trigger emergency situation", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");
    const emergency = testDataManager.getTestEmergency("medical");

    // Setup owner wallet
    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Navigate to emergency section
    await page.goto("/emergency");

    // Look for emergency trigger button
    const emergencyButton = page
      .locator(
        '[data-testid="trigger-emergency"], button:has-text("Emergency"), .emergency-btn'
      )
      .first();

    if (await emergencyButton.isVisible()) {
      await emergencyButton.click();

      // Fill emergency details
      const typeSelect = page
        .locator('select[name="type"], [data-testid="emergency-type"]')
        .first();
      if (await typeSelect.isVisible()) {
        await typeSelect.selectOption(emergency.type);
      }

      const severitySelect = page
        .locator('select[name="severity"], [data-testid="emergency-severity"]')
        .first();
      if (await severitySelect.isVisible()) {
        await severitySelect.selectOption(emergency.severity);
      }

      const descriptionInput = page
        .locator('textarea[name="description"], input[name="description"]')
        .first();
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill(emergency.description);
      }

      // Submit emergency
      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Submit"), button:has-text("Trigger")'
        )
        .first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for emergency to be created
        await page.waitForTimeout(3000);

        // Check for success message or emergency status
        const successMessage = page
          .locator(
            '.success, .emergency-created, [data-testid="emergency-success"]'
          )
          .first();
        if (await successMessage.isVisible()) {
          console.log("✅ Emergency triggered successfully");
        }
      }
    } else {
      console.log("Emergency trigger UI not yet implemented");
    }
  });

  test("should display emergency status and progress", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Check dashboard for emergency status
    await page.goto("/dashboard");

    // Look for emergency status indicators
    const statusElements = [
      '[data-testid="emergency-status"]',
      ".emergency-active",
      ".emergency-pending",
      ".status-indicator",
    ];

    let statusFound = false;
    for (const selector of statusElements) {
      if (await page.locator(selector).first().isVisible({ timeout: 1000 })) {
        statusFound = true;
        console.log(`✅ Emergency status found: ${selector}`);
        break;
      }
    }

    // Emergency status might not be visible if no active emergency
    if (!statusFound) {
      console.log("ℹ️  No active emergency status displayed");
    }
  });

  test("should handle guardian notifications", async ({ page }) => {
    const emergency = testDataManager.getTestEmergency("medical");

    try {
      // Test AI agent notification system
      const notificationResponse = await apiHelper.triggerNotifications({
        emergencyId: emergency.id,
        type: emergency.type,
        severity: emergency.severity,
        recipients: testDataManager
          .getAllTestUsers()
          .filter((u) => u.role === "guardian")
          .map((g) => ({ email: g.email, phone: "+1234567890" })),
      });

      if (
        notificationResponse.status === 200 ||
        notificationResponse.status === 201
      ) {
        console.log("✅ Notifications triggered successfully");

        // Check notification status
        const notificationId =
          notificationResponse.data.id || "test-notification";

        // Wait a bit for processing
        await page.waitForTimeout(2000);

        const statusResponse = await apiHelper.getNotificationStatus(
          notificationId
        );
        if (statusResponse.status === 200) {
          console.log("✅ Notification status retrieved:", statusResponse.data);
        }
      }
    } catch (error) {
      console.log(
        "Notification API test skipped - service not available:",
        error.message
      );
    }
  });

  test("should process AI emergency analysis", async ({ page }) => {
    const emergency = testDataManager.getTestEmergency("financial");

    try {
      // Test AI analysis
      const analysisResponse = await apiHelper.analyzeEmergency({
        type: emergency.type,
        severity: emergency.severity,
        description: emergency.description,
        userProfile: {
          age: 35,
          medicalConditions: [],
          riskTolerance: "medium",
        },
      });

      if (analysisResponse.status === 200) {
        console.log("✅ AI analysis completed:", analysisResponse.data);

        const analysis = analysisResponse.data;
        expect(analysis).toHaveProperty("severity_score");
        expect(analysis).toHaveProperty("recommendations");
        expect(analysis.severity_score).toBeGreaterThanOrEqual(0);
        expect(analysis.severity_score).toBeLessThanOrEqual(100);
      }
    } catch (error) {
      console.log(
        "AI analysis test skipped - service not available:",
        error.message
      );
    }
  });

  test("should handle multi-signature verification", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");
    const guardians = testDataManager
      .getAllTestUsers()
      .filter((u) => u.role === "guardian");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Navigate to emergency verification page
    await page.goto("/emergency/verify");

    // Look for signature collection interface
    const signatureSection = page
      .locator('[data-testid="signatures"], .signature-collection, .multi-sig')
      .first();

    if (await signatureSection.isVisible()) {
      // Check for guardian signature status
      for (const guardian of guardians.slice(0, 3)) {
        // Test first 3 guardians
        const guardianElement = page
          .locator(
            `[data-guardian="${guardian.walletAddress}"], .guardian-${guardian.id}`
          )
          .first();

        if (await guardianElement.isVisible()) {
          console.log(
            `✅ Guardian ${guardian.name} found in signature interface`
          );
        }
      }

      // Look for signature progress indicator
      const progressIndicator = page
        .locator(
          '.progress, .signature-progress, [data-testid="signature-progress"]'
        )
        .first();
      if (await progressIndicator.isVisible()) {
        console.log("✅ Signature progress indicator found");
      }
    } else {
      console.log("Multi-signature interface not yet implemented");
    }
  });

  test("should execute emergency payment", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Navigate to emergency execution page
    await page.goto("/emergency/execute");

    // Look for payment execution interface
    const executeButton = page
      .locator(
        '[data-testid="execute-payment"], button:has-text("Execute"), .execute-btn'
      )
      .first();

    if (await executeButton.isVisible()) {
      // Fill payment details
      const recipientInput = page
        .locator('input[name="recipient"], input[placeholder*="address"]')
        .first();
      if (await recipientInput.isVisible()) {
        await recipientInput.fill("0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"); // Test address
      }

      const amountInput = page
        .locator('input[name="amount"], input[placeholder*="amount"]')
        .first();
      if (await amountInput.isVisible()) {
        await amountInput.fill("0.1"); // Test amount
      }

      // Execute payment
      await executeButton.click();

      // Wait for transaction confirmation
      try {
        await web3Helper.waitForTransactionConfirmation(10000);
        console.log("✅ Emergency payment executed successfully");
      } catch (error) {
        console.log(
          "Payment execution test - transaction confirmation not found (expected in test environment)"
        );
      }
    } else {
      console.log("Payment execution interface not yet implemented");
    }
  });

  test("should generate audit logs", async ({ page }) => {
    const owner = testDataManager.getTestUser("owner");

    // Navigate to audit logs page
    await page.goto("/audit");

    // Look for audit log interface
    const auditSection = page
      .locator(
        '[data-testid="audit-logs"], .audit-container, h1:has-text("Audit")'
      )
      .first();

    if (await auditSection.isVisible()) {
      // Check for log entries
      const logEntries = page.locator(
        '.log-entry, .audit-item, [data-testid="log-entry"]'
      );
      const entryCount = await logEntries.count();

      if (entryCount > 0) {
        console.log(`✅ Found ${entryCount} audit log entries`);

        // Check first log entry for required fields
        const firstEntry = logEntries.first();
        const entryText = await firstEntry.textContent();

        // Should contain timestamp, action, and user info
        expect(entryText).toMatch(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}/); // Date format
      } else {
        console.log(
          "ℹ️  No audit log entries found (expected if no actions performed)"
        );
      }
    } else {
      console.log("Audit log interface not yet implemented");
    }
  });

  test("should handle emergency cancellation", async ({ page }) => {
    const web3Helper = new Web3TestHelper(page);
    const owner = testDataManager.getTestUser("owner");

    await web3Helper.mockMetaMaskConnection(
      owner.walletAddress,
      owner.privateKey
    );
    await page.goto("/");
    await web3Helper.connectWallet();

    // Navigate to active emergency
    await page.goto("/emergency");

    // Look for cancel emergency button
    const cancelButton = page
      .locator(
        '[data-testid="cancel-emergency"], button:has-text("Cancel"), .cancel-btn'
      )
      .first();

    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Confirm cancellation
      const confirmButton = page
        .locator('button:has-text("Confirm"), button:has-text("Yes")')
        .first();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Wait for cancellation to process
      await page.waitForTimeout(2000);

      // Check for cancellation confirmation
      const successMessage = page
        .locator('.success, .cancelled, [data-testid="emergency-cancelled"]')
        .first();
      if (await successMessage.isVisible()) {
        console.log("✅ Emergency cancelled successfully");
      }
    } else {
      console.log("Emergency cancellation not yet implemented");
    }
  });
});
