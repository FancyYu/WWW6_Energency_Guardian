/**
 * Header Component - 顶部导航栏
 * 使用玻璃拟态效果的现代化导航栏
 */

import React from "react";
import { GlassNavigation, GlassButton } from "../Glass";
import { useAppStore, useNotifications, useCurrentRole } from "../../store";
import { useRouter } from "../../context/RouterContext";
import { useWeb3 } from "../../hooks/useWeb3";
import { WalletType } from "../../services/web3";

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const BellIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

const WalletIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
    />
  </svg>
);

const SwitchIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    />
  </svg>
);

export const Header: React.FC = () => {
  const { setSidebarOpen, switchRole, setWallet } = useAppStore();
  const notifications = useNotifications();
  const currentRole = useCurrentRole();
  const { navigate } = useRouter();
  const {
    isConnected,
    isConnecting,
    walletInfo,
    error,
    connectWallet,
    disconnect,
  } = useWeb3();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const handleConnectWallet = async () => {
    try {
      await connectWallet(WalletType.METAMASK);
      // 更新store中的钱包状态
      if (walletInfo) {
        setWallet({
          isConnected: true,
          address: walletInfo.address,
          balance: walletInfo.balance,
          chainId: walletInfo.chainId,
          networkName: walletInfo.networkName,
        });
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      // 清除store中的钱包状态
      setWallet({
        isConnected: false,
        address: undefined,
        balance: undefined,
        chainId: undefined,
        networkName: undefined,
      });
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role === "protected_user" ? "用户" : "监护人";
  };

  const getPageTitle = (role: string) => {
    return role === "protected_user" ? "仪表板" : "监护人控制台";
  };

  return (
    <GlassNavigation
      variant="medium"
      position="static"
      scrollEffect={false}
      className="border-b border-glass-border/30"
    >
      <GlassNavigation.Brand>
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-glass-light transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <MenuIcon />
        </button>

        {/* Page title */}
        <div className="ml-4 lg:ml-0">
          <h1 className="text-xl font-semibold text-white">
            {getPageTitle(currentRole)}
          </h1>
        </div>
      </GlassNavigation.Brand>

      <GlassNavigation.Menu>
        {/* Role switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">当前身份:</span>
          <GlassButton
            variant="secondary"
            size="sm"
            leftIcon={<SwitchIcon />}
            onClick={switchRole}
            className="text-sm"
          >
            {getRoleDisplayName(currentRole)}
          </GlassButton>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-300 hover:text-white hover:bg-glass-light rounded-lg transition-colors">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-emergency-500 text-white text-xs flex items-center justify-center font-medium shadow-glow-red">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Wallet connection */}
        <div className="flex items-center space-x-3">
          {isConnected && walletInfo ? (
            <div className="flex items-center space-x-3">
              {/* Balance */}
              <div className="hidden sm:block text-sm text-gray-200">
                <div className="font-medium">
                  {walletInfo.balance
                    ? `${formatBalance(walletInfo.balance)} ETH`
                    : "0.0000 ETH"}
                </div>
                <div className="text-xs text-gray-400">
                  {formatAddress(walletInfo.address)}
                </div>
              </div>

              {/* Network indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-400 rounded-full shadow-glow-green"></div>
                <span className="hidden sm:inline text-sm text-gray-200">
                  {walletInfo.networkName}
                </span>
              </div>

              {/* Disconnect button */}
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                className="hidden sm:inline-flex"
              >
                断开连接
              </GlassButton>
            </div>
          ) : (
            <GlassButton
              variant="primary"
              size="sm"
              glow
              leftIcon={<WalletIcon />}
              onClick={handleConnectWallet}
              loading={isConnecting}
              disabled={isConnecting}
            >
              {isConnecting ? "连接中..." : "连接钱包"}
            </GlassButton>
          )}

          {/* Show error if any */}
          {error && (
            <div className="text-xs text-red-400 max-w-xs truncate">
              {error}
            </div>
          )}
        </div>

        {/* Emergency button - only show for protected users */}
        {currentRole === "protected_user" && (
          <GlassButton
            variant="emergency"
            size="sm"
            glow
            className="font-semibold"
            onClick={() => navigate("emergency")}
          >
            紧急求助
          </GlassButton>
        )}
      </GlassNavigation.Menu>
    </GlassNavigation>
  );
};
