/**
 * Simple Router Hook - 使用事件驱动的路由管理
 * 完全重写以解决React状态更新问题
 */

import { useState, useEffect } from "react";

export type Route =
  | "dashboard"
  | "emergency"
  | "guardians"
  | "settings"
  | "activities"
  | "approvals"
  | "protected-users"
  | "guardian-settings"
  | "guardian-reports";

interface RouterState {
  currentRoute: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
}

// 自定义事件名称
const ROUTE_CHANGE_EVENT = "routeChange";

// 全局导航函数
function navigateToRoute(route: Route) {
  console.log(`[Navigate] Changing route to: ${route}`);

  // 更新浏览器URL
  window.history.pushState({ route }, "", `/${route}`);

  // 触发自定义事件
  const event = new CustomEvent(ROUTE_CHANGE_EVENT, {
    detail: { route },
  });
  window.dispatchEvent(event);

  console.log(`[Navigate] Route change event dispatched: ${route}`);
}

export const useRouter = (): RouterState => {
  // 获取初始路由
  const getInitialRoute = (): Route => {
    const path = window.location.pathname.slice(1);
    return (path as Route) || "dashboard";
  };

  const [currentRoute, setCurrentRoute] = useState<Route>(getInitialRoute());

  // 监听自定义路由变化事件
  useEffect(() => {
    const handleRouteChange = (event: CustomEvent) => {
      const newRoute = event.detail.route;
      console.log(`[Router Hook] Received route change event: ${newRoute}`);
      setCurrentRoute(newRoute);
    };

    // 监听浏览器前进后退
    const handlePopState = (event: PopStateEvent) => {
      const route = event.state?.route || getInitialRoute();
      console.log(`[Router Hook] PopState event: ${route}`);
      setCurrentRoute(route);
    };

    // 添加事件监听器
    window.addEventListener(
      ROUTE_CHANGE_EVENT,
      handleRouteChange as EventListener
    );
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener(
        ROUTE_CHANGE_EVENT,
        handleRouteChange as EventListener
      );
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 导航函数
  const navigate = (route: Route) => {
    navigateToRoute(route);
  };

  // 返回函数
  const goBack = () => {
    window.history.back();
  };

  // 调试日志
  useEffect(() => {
    console.log(`[Router Hook] Current route updated: ${currentRoute}`);
  }, [currentRoute]);

  return {
    currentRoute,
    navigate,
    goBack,
  };
};
