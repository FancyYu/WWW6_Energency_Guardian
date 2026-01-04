/**
 * Web3 Service - Web3钱包集成服务
 *
 * 提供钱包连接、合约交互、交易签名等功能
 * 支持MetaMask、WalletConnect等主流钱包
 */

import { ethers, BrowserProvider, Contract, TransactionResponse } from "ethers";
import type { TransactionRequest } from "ethers";

// 支持的网络配置
export const SUPPORTED_NETWORKS = {
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/demo",
    blockExplorer: "https://etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  goerli: {
    chainId: 5,
    name: "Goerli Testnet",
    rpcUrl: "https://eth-goerli.g.alchemy.com/v2/demo",
    blockExplorer: "https://goerli.etherscan.io",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://127.0.0.1:8545",
    blockExplorer: "",
    nativeCurrency: {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

export type NetworkName = keyof typeof SUPPORTED_NETWORKS;

// 钱包类型
export const WalletType = {
  METAMASK: "metamask",
  WALLETCONNECT: "walletconnect",
  COINBASE: "coinbase",
  INJECTED: "injected",
} as const;

export type WalletType = (typeof WalletType)[keyof typeof WalletType];

// 连接状态
export const ConnectionStatus = {
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  ERROR: "error",
} as const;

export type ConnectionStatus =
  (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

// 钱包信息
export interface WalletInfo {
  address: string;
  chainId: number;
  networkName: string;
  balance: string;
  walletType: WalletType;
}

// 交易状态
export interface TransactionStatus {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
  blockNumber?: number;
  timestamp?: number;
}

// 合约调用选项
export interface ContractCallOptions {
  gasLimit?: string;
  gasPrice?: string;
  value?: string;
  nonce?: number;
}

// 事件监听器类型
export type EventListener<T = any> = (data: T) => void;

/**
 * Web3服务类
 */
export class Web3Service {
  private provider: BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private walletInfo: WalletInfo | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private eventListeners: Map<string, EventListener[]> = new Map();

  constructor() {
    this.initializeEventListeners();
    this.restoreConnectionState();
  }

  /**
   * 恢复连接状态
   */
  private async restoreConnectionState(): Promise<void> {
    try {
      // 检查是否有保存的连接状态
      const savedWalletType = localStorage.getItem("sheGuardian_walletType");
      const hasConnected =
        localStorage.getItem("sheGuardian_hasConnected") === "true";

      if (
        hasConnected &&
        savedWalletType &&
        typeof window !== "undefined" &&
        window.ethereum
      ) {
        // 检查是否仍然连接
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });

        if (accounts && accounts.length > 0) {
          // 自动重连
          console.log("Auto-reconnecting wallet...");
          await this.connectWallet(savedWalletType as WalletType);
        } else {
          // 清除过期的连接状态
          this.clearConnectionState();
        }
      }
    } catch (error) {
      console.log("Failed to restore connection state:", error);
      this.clearConnectionState();
    }
  }

  /**
   * 保存连接状态
   */
  private saveConnectionState(walletType: WalletType): void {
    localStorage.setItem("sheGuardian_hasConnected", "true");
    localStorage.setItem("sheGuardian_walletType", walletType);
    localStorage.setItem("sheGuardian_lastConnected", Date.now().toString());
  }

  /**
   * 清除连接状态
   */
  private clearConnectionState(): void {
    localStorage.removeItem("sheGuardian_hasConnected");
    localStorage.removeItem("sheGuardian_walletType");
    localStorage.removeItem("sheGuardian_lastConnected");
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 监听账户变化
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
          console.log("No accounts found, disconnecting...");
          this.disconnect();
        } else {
          this.handleAccountChange(accounts[0]);
        }
      });

      // 监听网络变化
      window.ethereum.on("chainChanged", (chainId: string) => {
        console.log("Chain changed:", chainId);
        this.handleNetworkChange(parseInt(chainId, 16));
      });

      // 监听连接状态变化
      window.ethereum.on("connect", (connectInfo: { chainId: string }) => {
        console.log("Wallet connected:", connectInfo);
      });

      window.ethereum.on("disconnect", (error: any) => {
        console.log("Wallet disconnected:", error);
        this.disconnect();
      });
    }
  }

  /**
   * 连接钱包
   * @param walletType 钱包类型
   * @returns 钱包信息
   */
  async connectWallet(
    walletType: WalletType = WalletType.METAMASK
  ): Promise<WalletInfo> {
    try {
      this.connectionStatus = ConnectionStatus.CONNECTING;
      this.emit("connectionStatusChanged", this.connectionStatus);

      let provider: any;

      switch (walletType) {
        case WalletType.METAMASK:
          provider = await this.connectMetaMask();
          break;
        case WalletType.WALLETCONNECT:
          provider = await this.connectWalletConnect();
          break;
        case WalletType.COINBASE:
          provider = await this.connectCoinbase();
          break;
        case WalletType.INJECTED:
          provider = await this.connectInjected();
          break;
        default:
          throw new Error(`Unsupported wallet type: ${walletType}`);
      }

      this.provider = new BrowserProvider(provider);
      this.signer = await this.provider.getSigner();

      // 获取钱包信息
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(address);

      this.walletInfo = {
        address,
        chainId: Number(network.chainId),
        networkName: this.getNetworkName(Number(network.chainId)),
        balance: ethers.formatEther(balance),
        walletType,
      };

      this.connectionStatus = ConnectionStatus.CONNECTED;
      this.emit("connectionStatusChanged", this.connectionStatus);
      this.emit("walletConnected", this.walletInfo);

      // 保存连接状态
      this.saveConnectionState(walletType);

      return this.walletInfo;
    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR;
      this.emit("connectionStatusChanged", this.connectionStatus);
      throw new Error(
        `Failed to connect wallet: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 连接MetaMask
   */
  private async connectMetaMask(): Promise<any> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask not detected. Please install MetaMask.");
    }

    // 检查是否是MetaMask
    if (!window.ethereum.isMetaMask) {
      throw new Error("Please use MetaMask wallet.");
    }

    // 请求连接
    await window.ethereum.request({ method: "eth_requestAccounts" });
    return window.ethereum;
  }

  /**
   * 连接WalletConnect
   */
  private async connectWalletConnect(): Promise<any> {
    // 注意：这里需要实际的WalletConnect集成
    // 由于WalletConnect v2的复杂性，这里提供一个简化的实现
    throw new Error("WalletConnect integration not implemented yet");
  }

  /**
   * 连接Coinbase钱包
   */
  private async connectCoinbase(): Promise<any> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Coinbase Wallet not detected.");
    }

    if (!window.ethereum.isCoinbaseWallet) {
      throw new Error("Please use Coinbase Wallet.");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    return window.ethereum;
  }

  /**
   * 连接注入的钱包
   */
  private async connectInjected(): Promise<any> {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("No injected wallet detected.");
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    return window.ethereum;
  }

  /**
   * 断开钱包连接
   */
  async disconnect(): Promise<void> {
    this.provider = null;
    this.signer = null;
    this.walletInfo = null;
    this.connectionStatus = ConnectionStatus.DISCONNECTED;

    // 清除保存的连接状态
    this.clearConnectionState();

    this.emit("connectionStatusChanged", this.connectionStatus);
    this.emit("walletDisconnected");
  }

  /**
   * 切换网络
   * @param networkName 网络名称
   */
  async switchNetwork(networkName: NetworkName): Promise<void> {
    if (!this.provider || !window.ethereum) {
      throw new Error("Wallet not connected");
    }

    const network = SUPPORTED_NETWORKS[networkName];
    const chainIdHex = `0x${network.chainId.toString(16)}`;

    try {
      // 尝试切换到指定网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      // 如果网络不存在，尝试添加网络
      if (error.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: network.name,
              nativeCurrency: network.nativeCurrency,
              rpcUrls: [network.rpcUrl],
              blockExplorerUrls: network.blockExplorer
                ? [network.blockExplorer]
                : [],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  /**
   * 获取合约实例
   * @param address 合约地址
   * @param abi 合约ABI
   * @returns 合约实例
   */
  getContract(address: string, abi: any[]): Contract {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    return new Contract(address, abi, this.signer);
  }

  /**
   * 调用合约只读方法
   * @param contract 合约实例
   * @param methodName 方法名
   * @param params 参数
   * @returns 调用结果
   */
  async callContractMethod(
    contract: Contract,
    methodName: string,
    params: any[] = []
  ): Promise<any> {
    try {
      return await contract[methodName](...params);
    } catch (error) {
      throw new Error(
        `Contract call failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 发送合约交易
   * @param contract 合约实例
   * @param methodName 方法名
   * @param params 参数
   * @param options 交易选项
   * @returns 交易响应
   */
  async sendContractTransaction(
    contract: Contract,
    methodName: string,
    params: any[] = [],
    options: ContractCallOptions = {}
  ): Promise<TransactionResponse> {
    try {
      const txOptions: any = {};

      if (options.gasLimit) txOptions.gasLimit = options.gasLimit;
      if (options.gasPrice) txOptions.gasPrice = options.gasPrice;
      if (options.value) txOptions.value = ethers.parseEther(options.value);
      if (options.nonce !== undefined) txOptions.nonce = options.nonce;

      const tx = await contract[methodName](...params, txOptions);

      // 监听交易状态
      this.monitorTransaction(tx.hash);

      return tx;
    } catch (error) {
      throw new Error(
        `Transaction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 发送ETH转账
   * @param to 接收地址
   * @param amount ETH数量
   * @param options 交易选项
   * @returns 交易响应
   */
  async sendTransaction(
    to: string,
    amount: string,
    options: ContractCallOptions = {}
  ): Promise<TransactionResponse> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const txRequest: TransactionRequest = {
        to,
        value: ethers.parseEther(amount),
      };

      if (options.gasLimit) txRequest.gasLimit = options.gasLimit;
      if (options.gasPrice) txRequest.gasPrice = options.gasPrice;
      if (options.nonce !== undefined) txRequest.nonce = options.nonce;

      const tx = await this.signer.sendTransaction(txRequest);

      // 监听交易状态
      this.monitorTransaction(tx.hash);

      return tx;
    } catch (error) {
      throw new Error(
        `Transaction failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 签名消息
   * @param message 要签名的消息
   * @returns 签名结果
   */
  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      throw new Error(
        `Message signing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 签名类型化数据 (EIP-712)
   * @param domain 域信息
   * @param types 类型定义
   * @param value 要签名的值
   * @returns 签名结果
   */
  async signTypedData(domain: any, types: any, value: any): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      return await this.signer.signTypedData(domain, types, value);
    } catch (error) {
      throw new Error(
        `Typed data signing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * 监控交易状态
   * @param txHash 交易哈希
   */
  private async monitorTransaction(txHash: string): Promise<void> {
    if (!this.provider) return;

    try {
      // 发送初始状态
      this.emit("transactionStatusChanged", {
        hash: txHash,
        status: "pending",
        confirmations: 0,
      } as TransactionStatus);

      // 等待交易确认
      const receipt = await this.provider.waitForTransaction(txHash);

      if (receipt) {
        const status: TransactionStatus = {
          hash: txHash,
          status: receipt.status === 1 ? "confirmed" : "failed",
          confirmations: await receipt.confirmations(),
          gasUsed: receipt.gasUsed.toString(),
          effectiveGasPrice: receipt.gasPrice?.toString(),
          blockNumber: receipt.blockNumber,
          timestamp: Date.now(),
        };

        this.emit("transactionStatusChanged", status);
      }
    } catch (error) {
      this.emit("transactionStatusChanged", {
        hash: txHash,
        status: "failed",
        confirmations: 0,
      } as TransactionStatus);
    }
  }

  /**
   * 获取网络名称
   * @param chainId 链ID
   * @returns 网络名称
   */
  private getNetworkName(chainId: number): string {
    for (const [name, config] of Object.entries(SUPPORTED_NETWORKS)) {
      if (config.chainId === chainId) {
        return name;
      }
    }
    return `Unknown (${chainId})`;
  }

  /**
   * 处理账户变化
   * @param newAddress 新地址
   */
  private async handleAccountChange(newAddress: string): Promise<void> {
    if (this.walletInfo && this.provider) {
      const balance = await this.provider.getBalance(newAddress);

      this.walletInfo = {
        ...this.walletInfo,
        address: newAddress,
        balance: ethers.formatEther(balance),
      };

      this.emit("accountChanged", this.walletInfo);
    }
  }

  /**
   * 处理网络变化
   * @param newChainId 新链ID
   */
  private async handleNetworkChange(newChainId: number): Promise<void> {
    if (this.walletInfo) {
      this.walletInfo = {
        ...this.walletInfo,
        chainId: newChainId,
        networkName: this.getNetworkName(newChainId),
      };

      this.emit("networkChanged", this.walletInfo);
    }
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: EventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener: EventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  // Getters
  get isConnected(): boolean {
    return this.connectionStatus === ConnectionStatus.CONNECTED;
  }

  get currentWallet(): WalletInfo | null {
    return this.walletInfo;
  }

  get currentProvider(): BrowserProvider | null {
    return this.provider;
  }

  get currentSigner(): ethers.JsonRpcSigner | null {
    return this.signer;
  }

  get status(): ConnectionStatus {
    return this.connectionStatus;
  }
}

// 全局Web3服务实例
export const web3Service = new Web3Service();

// 类型声明扩展
declare global {
  interface Window {
    ethereum?: any;
  }
}
