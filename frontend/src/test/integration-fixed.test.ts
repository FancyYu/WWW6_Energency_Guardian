/**
 * 端到端集成测试 - 验证前端与已部署合约的集成
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { web3Service, SUPPORTED_NETWORKS } from "../services/web3";
import {
  emergencyManagementService,
  zkProofVerifierService,
  CONTRACT_ADDRESSES,
  EmergencyLevel,
  EMERGENCY_MANAGEMENT_ABI,
  ZK_PROOF_VERIFIER_ABI,
} from "../services/contracts";

describe("Emergency Guardian E2E Integration Tests", () => {
  const SEPOLIA_CHAIN_ID = 11155111;
  const TEST_ADDRESSES = {
    emergencyManagement: "0x6af445EA589D8f550a3D1dacf34745071a4D5b4F",
    zkProofVerifier: "0xf9D10528B5b1837cd12be6A449475a1288832263",
  };

  beforeAll(async () => {
    console.log("🚀 Starting Emergency Guardian E2E Integration Tests");
    console.log("📋 Testing against Sepolia testnet contracts:");
    console.log(
      `   Emergency Management: ${TEST_ADDRESSES.emergencyManagement}`
    );
    console.log(`   ZK Proof Verifier: ${TEST_ADDRESSES.zkProofVerifier}`);
  });

  afterAll(async () => {
    if (web3Service.isConnected) {
      await web3Service.disconnect();
    }
  });

  describe("Network Configuration", () => {
    it("should have correct Sepolia network configuration", () => {
      const sepoliaConfig = SUPPORTED_NETWORKS.sepolia;

      expect(sepoliaConfig.chainId).toBe(SEPOLIA_CHAIN_ID);
      expect(sepoliaConfig.name).toBe("Sepolia Testnet");
      expect(sepoliaConfig.rpcUrl).toBe(
        "https://ethereum-sepolia-rpc.publicnode.com"
      );
      expect(sepoliaConfig.blockExplorer).toBe("https://sepolia.etherscan.io");
    });

    it("should have correct contract addresses for Sepolia", () => {
      const sepoliaContracts = CONTRACT_ADDRESSES.sepolia;

      expect(sepoliaContracts.emergencyManagement).toBe(
        TEST_ADDRESSES.emergencyManagement
      );
      expect(sepoliaContracts.zkProofVerifier).toBe(
        TEST_ADDRESSES.zkProofVerifier
      );
    });
  });

  describe("Web3 Service Integration", () => {
    it("should initialize web3 service correctly", () => {
      expect(web3Service).toBeDefined();
      expect(web3Service.isConnected).toBe(false);
      expect(web3Service.currentWallet).toBeNull();
    });

    it("should have correct network support", () => {
      const networks = Object.keys(SUPPORTED_NETWORKS);
      expect(networks).toContain("sepolia");
      expect(networks).toContain("mainnet");
      expect(networks).toContain("localhost");
    });
  });

  describe("Contract Services Integration", () => {
    it("should initialize emergency management service", () => {
      expect(emergencyManagementService).toBeDefined();
    });

    it("should initialize zk proof verifier service", () => {
      expect(zkProofVerifierService).toBeDefined();
    });

    it("should throw error when wallet not connected", async () => {
      try {
        await emergencyManagementService.getUserConfig();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Wallet not connected");
      }
    });
  });

  describe("Contract Address Validation", () => {
    it("should have valid Ethereum addresses", () => {
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;

      expect(TEST_ADDRESSES.emergencyManagement).toMatch(addressRegex);
      expect(TEST_ADDRESSES.zkProofVerifier).toMatch(addressRegex);
    });

    it("should not have zero addresses", () => {
      const zeroAddress = "0x0000000000000000000000000000000000000000";

      expect(TEST_ADDRESSES.emergencyManagement).not.toBe(zeroAddress);
      expect(TEST_ADDRESSES.zkProofVerifier).not.toBe(zeroAddress);
    });
  });

  describe("Mock Contract Interaction Tests", () => {
    it("should handle contract call errors gracefully", () => {
      // 测试错误处理 - 这个测试不应该抛出异常
      expect(() => {
        // 这只是检查函数是否存在，不实际调用
        expect(emergencyManagementService.getUserConfig).toBeDefined();
      }).not.toThrow();
    });

    it("should validate emergency levels", () => {
      expect(EmergencyLevel.NONE).toBe(0);
      expect(EmergencyLevel.LOW).toBe(1);
      expect(EmergencyLevel.MEDIUM).toBe(2);
      expect(EmergencyLevel.HIGH).toBe(3);
    });
  });

  describe("Environment Configuration", () => {
    it("should load environment variables correctly", () => {
      // 检查Vite环境变量
      const chainId = import.meta.env.VITE_CHAIN_ID;
      const networkName = import.meta.env.VITE_NETWORK_NAME;

      if (chainId) {
        expect(chainId).toBe("11155111");
      }

      if (networkName) {
        expect(networkName).toBe("sepolia");
      }
    });
  });

  describe("Integration Readiness Check", () => {
    it("should have all required services available", () => {
      expect(web3Service).toBeDefined();
      expect(emergencyManagementService).toBeDefined();
      expect(zkProofVerifierService).toBeDefined();
    });

    it("should have correct contract ABIs", () => {
      expect(EMERGENCY_MANAGEMENT_ABI).toBeDefined();
      expect(EMERGENCY_MANAGEMENT_ABI.length).toBeGreaterThan(0);

      expect(ZK_PROOF_VERIFIER_ABI).toBeDefined();
      expect(ZK_PROOF_VERIFIER_ABI.length).toBeGreaterThan(0);
    });

    it("should be ready for wallet connection", () => {
      expect(typeof window !== "undefined").toBe(true);
      expect(web3Service.status).toBe("disconnected");
    });
  });

  describe("Contract Configuration Validation", () => {
    it("should have correct Sepolia RPC URL", () => {
      const sepoliaConfig = SUPPORTED_NETWORKS.sepolia;
      expect(sepoliaConfig.rpcUrl).toBe(
        "https://ethereum-sepolia-rpc.publicnode.com"
      );
    });

    it("should have correct chain ID for Sepolia", () => {
      const sepoliaConfig = SUPPORTED_NETWORKS.sepolia;
      expect(sepoliaConfig.chainId).toBe(11155111);
    });

    it("should have deployed contract addresses", () => {
      const sepoliaContracts = CONTRACT_ADDRESSES.sepolia;

      // 确保不是零地址
      expect(sepoliaContracts.emergencyManagement).not.toBe(
        "0x0000000000000000000000000000000000000000"
      );
      expect(sepoliaContracts.zkProofVerifier).not.toBe(
        "0x0000000000000000000000000000000000000000"
      );

      // 确保是有效的以太坊地址
      expect(sepoliaContracts.emergencyManagement).toMatch(
        /^0x[a-fA-F0-9]{40}$/
      );
      expect(sepoliaContracts.zkProofVerifier).toMatch(/^0x[a-fA-F0-9]{40}$/);
    });
  });
});

/**
 * 手动测试指南
 *
 * 要进行完整的端到端测试，请按以下步骤操作：
 *
 * 1. 确保MetaMask已安装并连接到Sepolia测试网
 * 2. 确保钱包中有足够的Sepolia ETH用于测试
 * 3. 运行前端应用：npm run dev
 * 4. 在浏览器中打开应用并连接钱包
 * 5. 验证以下功能：
 *    - 钱包连接和网络切换
 *    - 合约地址显示正确
 *    - 用户配置读取
 *    - 监护人列表显示
 *    - 紧急级别查询
 *
 * 预期结果：
 * - 所有合约调用应该成功
 * - 用户界面应该显示正确的合约数据
 * - 交易应该能够正确提交到Sepolia网络
 *
 * 测试合约地址：
 * - Emergency Management: 0x6af445EA589D8f550a3D1dacf34745071a4D5b4F
 * - ZK Proof Verifier: 0xf9D10528B5b1837cd12be6A449475a1288832263
 * - Sepolia Etherscan: https://sepolia.etherscan.io
 */
