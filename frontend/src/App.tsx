/**
 * App Component - 主应用组件
 * 集成动画系统和页面过渡效果
 */

import { useEffect, useState } from "react";
import { Layout, Dashboard, GuardianDashboard } from "./components/Dashboard";
import { EmergencyPage } from "./components/Emergency";
import { useCurrentRole } from "./store";
import { useRouter } from "./hooks/useRouter";
import {
  PageTransitionWrapper,
  PageLoader,
} from "./animations/PageLoadingAnimations";
import { initializeAnimationSystem } from "./animations";
import "./index.css";

function App() {
  const currentRole = useCurrentRole();
  const { currentRoute } = useRouter();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRouteChanging, setIsRouteChanging] = useState(false);

  // 初始化动画系统
  useEffect(() => {
    initializeAnimationSystem();

    // 模拟初始加载时间
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 路由变化时的过渡效果
  useEffect(() => {
    setIsRouteChanging(true);
    const timer = setTimeout(() => {
      setIsRouteChanging(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentRoute]);

  const renderContent = () => {
    switch (currentRoute) {
      case "emergency":
        return <EmergencyPage />;
      case "dashboard":
      default:
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
        isLoading={isRouteChanging}
        animationDelay={100}
        staggerChildren={currentRoute === "dashboard"}
        staggerDelay={150}
      >
        {currentRoute === "emergency" ? (
          // Emergency page has its own layout
          renderContent()
        ) : (
          <Layout>{renderContent()}</Layout>
        )}
      </PageTransitionWrapper>
    </div>
  );
}

export default App;
