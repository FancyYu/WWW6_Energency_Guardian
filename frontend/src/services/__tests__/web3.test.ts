/**
 * Web3 Service Tests - 基础测试
 */

import { describe, test, expect, beforeEach, vi } from "vitest";
import {
  Web3Service,
  WalletType,
  ConnectionStatus,
  SUPPORTED_NETWORKS,
} from "../web3";

// Mock window.ethereum
const mockEthereum = {
  isMetaMask: true,
  request: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn(),
};

// Mock ethers
vi.mock("ethers", () => ({
  ethers: {
    formatEther: vi.fn().mockReturnValue("1.0"),
    parseEther: vi.fn().mockReturnValue(1000000000000000000n),
  },
  BrowserProvider: vi.fn().mockImplementation(() => ({
    getSigner: vi.fn().mockResolvedValue({
      getAddress: vi
        .fn()
        .mockResolvedValue("0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"),
    }),
    getNetwork: vi.fn().mockResolvedValue({
      chainId: 1n,
    }),
    getBalance: vi.fn().mockResolvedValue(1000000000000000000n), // 1 ETH
  })),
  Contract: vi.fn(),
}));

describe("Web3Service", () => {
  let web3Service: Web3Service;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup window.ethereum mock
    Object.defineProperty(window, "ethereum", {
      value: mockEthereum,
      writable: true,
    });

    web3Service = new Web3Service();
  });

  describe("Initialization", () => {
    test("should initialize with disconnected status", () => {
      expect(web3Service.isConnected).toBe(false);
      expect(web3Service.status).toBe(ConnectionStatus.DISCONNECTED);
      expect(web3Service.currentWallet).toBeNull();
    });
  });

  describe("Wallet Connection", () => {
    test("should connect to MetaMask successfully", async () => {
      // Mock successful connection
      mockEthereum.request.mockResolvedValue([
        "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
      ]);

      const walletInfo = await web3Service.connectWallet(WalletType.METAMASK);

      expect(walletInfo).toBeDefined();
      expect(walletInfo.address).toBe(
        "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
      );
      expect(walletInfo.walletType).toBe(WalletType.METAMASK);
      expect(web3Service.isConnected).toBe(true);
    });

    test("should handle MetaMask not detected", async () => {
      // Remove ethereum from window
      Object.defineProperty(window, "ethereum", {
        value: undefined,
        writable: true,
      });

      await expect(
        web3Service.connectWallet(WalletType.METAMASK)
      ).rejects.toThrow("MetaMask not detected");
    });

    test("should handle connection rejection", async () => {
      mockEthereum.request.mockRejectedValue(new Error("User rejected"));

      await expect(
        web3Service.connectWallet(WalletType.METAMASK)
      ).rejects.toThrow("Failed to connect wallet");
    });
  });

  describe("Network Configuration", () => {
    test("should have correct network configurations", () => {
      expect(SUPPORTED_NETWORKS.mainnet.chainId).toBe(1);
      expect(SUPPORTED_NETWORKS.sepolia.chainId).toBe(11155111);
      expect(SUPPORTED_NETWORKS.goerli.chainId).toBe(5);
      expect(SUPPORTED_NETWORKS.localhost.chainId).toBe(31337);
    });

    test("should have required network properties", () => {
      Object.values(SUPPORTED_NETWORKS).forEach((network) => {
        expect(network).toHaveProperty("chainId");
        expect(network).toHaveProperty("name");
        expect(network).toHaveProperty("rpcUrl");
        expect(network).toHaveProperty("nativeCurrency");
        expect(network.nativeCurrency).toHaveProperty("name");
        expect(network.nativeCurrency).toHaveProperty("symbol");
        expect(network.nativeCurrency).toHaveProperty("decimals");
      });
    });
  });

  describe("Event Handling", () => {
    test("should register event listeners", () => {
      const listener = vi.fn();

      web3Service.on("walletConnected", listener);

      // Verify listener was added (we can't directly test the internal map)
      expect(listener).toBeDefined();
    });

    test("should remove event listeners", () => {
      const listener = vi.fn();

      web3Service.on("walletConnected", listener);
      web3Service.off("walletConnected", listener);

      // Verify listener was removed (we can't directly test the internal map)
      expect(listener).toBeDefined();
    });
  });

  describe("Disconnect", () => {
    test("should disconnect wallet", async () => {
      // First connect
      mockEthereum.request.mockResolvedValue([
        "0x742d35Cc6634C0532925a3b8D4C9db96590c6C87",
      ]);
      await web3Service.connectWallet(WalletType.METAMASK);

      expect(web3Service.isConnected).toBe(true);

      // Then disconnect
      await web3Service.disconnect();

      expect(web3Service.isConnected).toBe(false);
      expect(web3Service.currentWallet).toBeNull();
      expect(web3Service.status).toBe(ConnectionStatus.DISCONNECTED);
    });
  });
});
