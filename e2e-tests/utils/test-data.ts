import { ethers } from "ethers";

export interface TestUser {
  id: string;
  name: string;
  email: string;
  walletAddress: string;
  privateKey: string;
  role: "owner" | "guardian" | "user";
}

export interface TestEmergency {
  id: string;
  type: "medical" | "financial" | "security";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  requiredApprovals: number;
  timelock: number;
}

export class TestDataManager {
  private testUsers: TestUser[] = [];
  private testEmergencies: TestEmergency[] = [];

  async initializeTestData(): Promise<void> {
    console.log("📊 Initializing test data...");

    // Generate test users with wallets
    this.testUsers = await this.generateTestUsers();

    // Generate test emergency scenarios
    this.testEmergencies = this.generateTestEmergencies();

    console.log(
      `✅ Generated ${this.testUsers.length} test users and ${this.testEmergencies.length} emergency scenarios`
    );
  }

  private async generateTestUsers(): Promise<TestUser[]> {
    const users: TestUser[] = [];

    // Owner account
    const ownerWallet = ethers.Wallet.createRandom();
    users.push({
      id: "owner-1",
      name: "Alice Owner",
      email: "alice@example.com",
      walletAddress: ownerWallet.address,
      privateKey: ownerWallet.privateKey,
      role: "owner",
    });

    // Guardian accounts
    for (let i = 1; i <= 3; i++) {
      const guardianWallet = ethers.Wallet.createRandom();
      users.push({
        id: `guardian-${i}`,
        name: `Guardian ${i}`,
        email: `guardian${i}@example.com`,
        walletAddress: guardianWallet.address,
        privateKey: guardianWallet.privateKey,
        role: "guardian",
      });
    }

    // Regular user accounts
    for (let i = 1; i <= 2; i++) {
      const userWallet = ethers.Wallet.createRandom();
      users.push({
        id: `user-${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        walletAddress: userWallet.address,
        privateKey: userWallet.privateKey,
        role: "user",
      });
    }

    return users;
  }

  private generateTestEmergencies(): TestEmergency[] {
    return [
      {
        id: "emergency-medical-1",
        type: "medical",
        severity: "critical",
        description:
          "Emergency surgery required - immediate fund access needed",
        requiredApprovals: 2,
        timelock: 3600, // 1 hour
      },
      {
        id: "emergency-financial-1",
        type: "financial",
        severity: "high",
        description:
          "Wallet compromise detected - secure funds transfer needed",
        requiredApprovals: 3,
        timelock: 7200, // 2 hours
      },
      {
        id: "emergency-security-1",
        type: "security",
        severity: "medium",
        description: "Suspicious activity detected - precautionary measures",
        requiredApprovals: 2,
        timelock: 14400, // 4 hours
      },
    ];
  }

  getTestUser(
    role: "owner" | "guardian" | "user",
    index: number = 0
  ): TestUser {
    const users = this.testUsers.filter((user) => user.role === role);
    if (index >= users.length) {
      throw new Error(`Test user ${role}[${index}] not found`);
    }
    return users[index];
  }

  getTestEmergency(type: "medical" | "financial" | "security"): TestEmergency {
    const emergency = this.testEmergencies.find((e) => e.type === type);
    if (!emergency) {
      throw new Error(`Test emergency of type ${type} not found`);
    }
    return emergency;
  }

  getAllTestUsers(): TestUser[] {
    return [...this.testUsers];
  }

  getAllTestEmergencies(): TestEmergency[] {
    return [...this.testEmergencies];
  }

  async cleanupTestData(): Promise<void> {
    console.log("🧹 Cleaning up test data...");

    // In a real implementation, this would:
    // 1. Clean up any test data from databases
    // 2. Reset blockchain state if using a test network
    // 3. Clear any temporary files or caches

    this.testUsers = [];
    this.testEmergencies = [];

    console.log("✅ Test data cleanup completed");
  }

  // Helper method to get formatted wallet info for Web3 testing
  getWalletInfo(userId: string): { address: string; privateKey: string } {
    const user = this.testUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error(`User ${userId} not found`);
    }
    return {
      address: user.walletAddress,
      privateKey: user.privateKey,
    };
  }
}
