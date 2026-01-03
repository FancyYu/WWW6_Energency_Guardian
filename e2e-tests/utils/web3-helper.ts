import { Page } from "@playwright/test";
import { ethers } from "ethers";

export class Web3TestHelper {
  constructor(private page: Page) {}

  /**
   * Mock MetaMask connection for testing
   * In a real implementation, this would use a proper Web3 testing framework
   */
  async mockMetaMaskConnection(
    walletAddress: string,
    privateKey: string
  ): Promise<void> {
    // Inject mock Web3 provider into the page
    await this.page.addInitScript(
      (address, key) => {
        // Mock ethereum object
        (window as any).ethereum = {
          isMetaMask: true,
          selectedAddress: address,
          chainId: "0x1", // Mainnet for testing

          request: async ({ method, params }: any) => {
            switch (method) {
              case "eth_requestAccounts":
                return [address];
              case "eth_accounts":
                return [address];
              case "eth_chainId":
                return "0x1";
              case "personal_sign":
                // Mock signing - in real tests you'd use the private key
                return "0x" + "mock_signature".repeat(10);
              case "eth_sendTransaction":
                // Mock transaction - return a fake hash
                return "0x" + "mock_transaction_hash".repeat(3);
              default:
                throw new Error(`Unsupported method: ${method}`);
            }
          },

          on: (event: string, handler: Function) => {
            // Mock event listeners
          },

          removeListener: (event: string, handler: Function) => {
            // Mock event removal
          },
        };
      },
      walletAddress,
      privateKey
    );
  }

  /**
   * Connect wallet in the application
   */
  async connectWallet(): Promise<void> {
    // Look for wallet connection button
    const connectButton = this.page
      .locator(
        '[data-testid="connect-wallet"], button:has-text("Connect Wallet")'
      )
      .first();

    if (await connectButton.isVisible()) {
      await connectButton.click();

      // Wait for connection to complete
      await this.page.waitForSelector(
        '[data-testid="wallet-connected"], [data-testid="wallet-address"]',
        {
          timeout: 10000,
        }
      );
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnectWallet(): Promise<void> {
    const disconnectButton = this.page
      .locator(
        '[data-testid="disconnect-wallet"], button:has-text("Disconnect")'
      )
      .first();

    if (await disconnectButton.isVisible()) {
      await disconnectButton.click();
    }
  }

  /**
   * Get connected wallet address from UI
   */
  async getConnectedAddress(): Promise<string | null> {
    try {
      const addressElement = this.page
        .locator('[data-testid="wallet-address"]')
        .first();
      if (await addressElement.isVisible()) {
        return await addressElement.textContent();
      }
    } catch (error) {
      // Address not found or not visible
    }
    return null;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransactionConfirmation(timeout: number = 30000): Promise<void> {
    await this.page.waitForSelector(
      '[data-testid="transaction-confirmed"], .transaction-success',
      {
        timeout,
      }
    );
  }

  /**
   * Check if wallet is connected
   */
  async isWalletConnected(): Promise<boolean> {
    try {
      const connectedIndicator = this.page
        .locator('[data-testid="wallet-connected"]')
        .first();
      return await connectedIndicator.isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Sign a message (mocked for testing)
   */
  async signMessage(message: string): Promise<string> {
    // In a real implementation, this would trigger the actual signing flow
    // For testing, we return a mock signature
    return "0x" + "mock_signature_for_" + message.replace(/\s+/g, "_");
  }

  /**
   * Switch network (mocked for testing)
   */
  async switchNetwork(chainId: string): Promise<void> {
    // Mock network switching
    await this.page.evaluate((id) => {
      if ((window as any).ethereum) {
        (window as any).ethereum.chainId = id;
      }
    }, chainId);
  }

  /**
   * Get current network
   */
  async getCurrentNetwork(): Promise<string> {
    return await this.page.evaluate(() => {
      return (window as any).ethereum?.chainId || "0x1";
    });
  }
}
