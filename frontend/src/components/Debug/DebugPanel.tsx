/**
 * Debug Panel - 调试面板组件
 */

import React from "react";
import { useWeb3 } from "../../hooks/useWeb3";
import { useAppStore } from "../../store";

export const DebugPanel: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    walletInfo,
    error,
    connectWallet,
    disconnect,
  } = useWeb3();

  const { wallet, currentRole } = useAppStore();

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>

      <div className="space-y-1">
        <div>
          <strong>Web3 Hook:</strong>
        </div>
        <div>- Connected: {isConnected ? "✅" : "❌"}</div>
        <div>- Connecting: {isConnecting ? "⏳" : "❌"}</div>
        <div>- Address: {walletInfo?.address || "None"}</div>
        <div>- Network: {walletInfo?.networkName || "None"}</div>
        <div>- Error: {error || "None"}</div>

        <div className="mt-2">
          <strong>Store State:</strong>
        </div>
        <div>- Store Connected: {wallet.isConnected ? "✅" : "❌"}</div>
        <div>- Store Address: {wallet.address || "None"}</div>
        <div>- Current Role: {currentRole}</div>

        <div className="mt-2 space-x-2">
          <button
            onClick={() => connectWallet()}
            className="bg-blue-600 px-2 py-1 rounded text-xs"
            disabled={isConnecting}
          >
            Connect
          </button>
          <button
            onClick={() => disconnect()}
            className="bg-red-600 px-2 py-1 rounded text-xs"
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
};
