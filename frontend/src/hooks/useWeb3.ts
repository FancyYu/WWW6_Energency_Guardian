/**
 * useWeb3 Hook - Web3钱包连接和状态管理Hook
 */

import { useState, useEffect, useCallback } from "react";
import { web3Service, WalletType, ConnectionStatus } from "../services/web3";
import type { WalletInfo, TransactionStatus } from "../services/web3";

export interface UseWeb3Return {
  // 状态
  isConnected: boolean;
  isConnecting: boolean;
  walletInfo: WalletInfo | null;
  connectionStatus: ConnectionStatus;
  error: string | null;

  // 方法
  connectWallet: (walletType?: WalletType) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (networkName: string) => Promise<void>;

  // 交易状态
  transactionStatus: TransactionStatus | null;
}

export const useWeb3 = (): UseWeb3Return => {
  const [isConnected, setIsConnected] = useState(web3Service.isConnected);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(
    web3Service.currentWallet
  );
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    web3Service.status
  );
  const [error, setError] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus | null>(null);

  // 连接钱包
  const connectWallet = useCallback(
    async (walletType: WalletType = WalletType.METAMASK) => {
      try {
        setIsConnecting(true);
        setError(null);

        const wallet = await web3Service.connectWallet(walletType);
        setWalletInfo(wallet);
        setIsConnected(true);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to connect wallet";
        setError(errorMessage);
        console.error("Wallet connection error:", err);
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  // 断开连接
  const disconnect = useCallback(async () => {
    try {
      await web3Service.disconnect();
      setWalletInfo(null);
      setIsConnected(false);
      setError(null);
    } catch (err) {
      console.error("Disconnect error:", err);
    }
  }, []);

  // 切换网络
  const switchNetwork = useCallback(async (networkName: string) => {
    try {
      setError(null);
      await web3Service.switchNetwork(networkName as any);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to switch network";
      setError(errorMessage);
      console.error("Network switch error:", err);
    }
  }, []);

  // 设置事件监听器
  useEffect(() => {
    const handleConnectionStatusChanged = (status: ConnectionStatus) => {
      setConnectionStatus(status);
      setIsConnected(status === ConnectionStatus.CONNECTED);

      if (status === ConnectionStatus.DISCONNECTED) {
        setWalletInfo(null);
      }
    };

    const handleWalletConnected = (wallet: WalletInfo) => {
      setWalletInfo(wallet);
      setIsConnected(true);
      setError(null);
    };

    const handleWalletDisconnected = () => {
      setWalletInfo(null);
      setIsConnected(false);
    };

    const handleAccountChanged = (wallet: WalletInfo) => {
      setWalletInfo(wallet);
    };

    const handleNetworkChanged = (wallet: WalletInfo) => {
      setWalletInfo(wallet);
    };

    const handleTransactionStatusChanged = (status: TransactionStatus) => {
      setTransactionStatus(status);
    };

    // 添加事件监听器
    web3Service.on("connectionStatusChanged", handleConnectionStatusChanged);
    web3Service.on("walletConnected", handleWalletConnected);
    web3Service.on("walletDisconnected", handleWalletDisconnected);
    web3Service.on("accountChanged", handleAccountChanged);
    web3Service.on("networkChanged", handleNetworkChanged);
    web3Service.on("transactionStatusChanged", handleTransactionStatusChanged);

    // 清理函数
    return () => {
      web3Service.off("connectionStatusChanged", handleConnectionStatusChanged);
      web3Service.off("walletConnected", handleWalletConnected);
      web3Service.off("walletDisconnected", handleWalletDisconnected);
      web3Service.off("accountChanged", handleAccountChanged);
      web3Service.off("networkChanged", handleNetworkChanged);
      web3Service.off(
        "transactionStatusChanged",
        handleTransactionStatusChanged
      );
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    walletInfo,
    connectionStatus,
    error,
    connectWallet,
    disconnect,
    switchNetwork,
    transactionStatus,
  };
};
