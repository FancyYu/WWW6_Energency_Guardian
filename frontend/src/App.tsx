/**
 * App Component - 主应用组件
 * 集成动画系统和页面过渡效果
 */

import { useEffect, useState } from "react";
import { Layout, Dashboard, GuardianDashboard } from "./components/Dashboard";
import { EmergencyPage } from "./components/Emergency";
import { GuardiansPage } from "./components/Guardians/GuardiansPage";
import { SettingsPage } from "./components/Settings/SettingsPage";
import { ActivitiesPage } from "./components/Activities/ActivitiesPage";
import { DebugPanel } from "./components/Debug/DebugPanel";
import { useCurrentRole, useAppStore } from "./store";
import { RouterProvider, useRouter } from "./context/RouterContext";
import {
  PageTransitionWrapper,
  PageLoader,
} from "./animations/PageLoadingAnimations";
import { initializeAnimationSystem } from "./animations";
import { initializeDemoData } from "./utils/demoData";
import "./index.css";

function AppContent() {
  const currentRole = useCurrentRole();
  const { currentRoute } = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const [routeKey, setRouteKey] = useState(0);

  // 初始化动画系统和演示数据
  useEffect(() => {
    initializeAnimationSystem();

    // 初始化演示数据
    initializeDemoData(useAppStore);

    // 模拟初始加载时间
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 路由变化时的过渡效果
  useEffect(() => {
    console.log(`[App] Route changed to: ${currentRoute}`);
    setIsRouteChanging(true);
    setRouteKey((prev) => prev + 1); // Force re-render with new key
    const timer = setTimeout(() => {
      setIsRouteChanging(false);
      console.log(`[App] Route transition completed for: ${currentRoute}`);
    }, 100); // 减少延迟

    return () => clearTimeout(timer);
  }, [currentRoute]);

  const renderContent = () => {
    console.log(`Rendering content for route: ${currentRoute}`);
    switch (currentRoute) {
      case "emergency":
        console.log("Rendering EmergencyPage");
        return <EmergencyPage />;
      case "guardians":
        console.log("Rendering GuardiansPage");
        return <GuardiansPage />;
      case "settings":
        console.log("Rendering SettingsPage");
        return <SettingsPage />;
      case "activities":
        console.log("Rendering ActivitiesPage");
        return <ActivitiesPage />;
      case "dashboard":
      default:
        console.log("Rendering Dashboard");
        return currentRole === "protected_user" ? (
          <Dashboard />
        ) : (
          <GuardianDashboard />
        );
    }
  };

  // 显示初始加载器
  if (isInitialLoading) {
    return (
      <PageLoader
        isLoading={true}
        variant="wave"
        size="lg"
        message="Initializing Emergency Guardian..."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <PageTransitionWrapper
        key={`${currentRoute}-${routeKey}`} // Force re-render when route changes
        isLoading={isRouteChanging}
        animationDelay={100}
        staggerChildren={currentRoute === "dashboard"}
        staggerDelay={150}
      >
        {currentRoute === "emergency" ? (
          // Emergency page has its own layout
          <div key={`emergency-${routeKey}`}>{renderContent()}</div>
        ) : (
          <Layout key={`layout-${routeKey}`}>{renderContent()}</Layout>
        )}
      </PageTransitionWrapper>

      {/* Debug Panel - 只在开发环境显示 */}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </div>
  );
}

function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}

export default App;
