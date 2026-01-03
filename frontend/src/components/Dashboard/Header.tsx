/**
 * Header Component - 顶部导航栏
 */

import React from "react";
import { Button } from "../Common";
import {
  useAppStore,
  useWallet,
  useNotifications,
  useCurrentRole,
} from "../../store";

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
  const { setSidebarOpen, switchRole } = useAppStore();
  const wallet = useWallet();
  const notifications = useNotifications();
  const currentRole = useCurrentRole();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num.toFixed(4);
  };

  const handleConnectWallet = () => {
    // 临时的模拟连接
    console.log("Connect wallet clicked");
  };

  const handleDisconnect = () => {
    // 临时的模拟断开
    console.log("Disconnect clicked");
  };

  const getRoleDisplayName = (role: string) => {
    return role === "protected_user" ? "用户" : "监护人";
  };

  const getPageTitle = (role: string) => {
    return role === "protected_user" ? "仪表板" : "监护人控制台";
  };

  return (
    <header className="bg-white border-b border-gray-200 lg:border-b-0">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left side */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </button>

          {/* Page title */}
          <div className="ml-4 lg:ml-0">
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle(currentRole)}
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Role switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">当前身份:</span>
            <Button
              variant="outline"
              size="sm"
              icon={<SwitchIcon />}
              onClick={switchRole}
              className="text-sm"
            >
              {getRoleDisplayName(currentRole)}
            </Button>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md">
            <BellIcon />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            )}
          </button>

          {/* Wallet connection */}
          <div className="flex items-center space-x-3">
            {wallet.isConnected ? (
              <div className="flex items-center space-x-3">
                {/* Balance */}
                <div className="hidden sm:block text-sm text-gray-700">
                  <div className="font-medium">
                    {wallet.balance
                      ? `${formatBalance(wallet.balance)} ETH`
                      : "0.0000 ETH"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {wallet.address ? formatAddress(wallet.address) : ""}
                  </div>
                </div>

                {/* Wallet indicator */}
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="hidden sm:inline text-sm text-gray-700">
                    已连接
                  </span>
                </div>

                {/* Disconnect button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="hidden sm:inline-flex"
                >
                  断开连接
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<WalletIcon />}
                onClick={handleConnectWallet}
              >
                连接钱包
              </Button>
            )}
          </div>

          {/* Emergency button - only show for protected users */}
          {currentRole === "protected_user" && (
            <Button variant="emergency" size="sm" className="font-semibold">
              紧急求助
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
