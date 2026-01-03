/**
 * Router Context - 全局路由状态管理
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

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

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
  goBack: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentRoute, setCurrentRoute] = useState<Route>("dashboard");
  const [history, setHistory] = useState<Route[]>(["dashboard"]);

  // 初始化路由
  useEffect(() => {
    const path = window.location.pathname.slice(1) as Route;
    const initialRoute = path || "dashboard";

    console.log(
      `Router Context initialized with path: "${path}", route: "${initialRoute}"`
    );

    if (initialRoute !== currentRoute) {
      setCurrentRoute(initialRoute);
    }
  }, [currentRoute]);

  // 监听浏览器前进后退
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) as Route;
      console.log(`PopState event in context: ${path || "dashboard"}`);
      setCurrentRoute(path || "dashboard");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback(
    (route: Route) => {
      console.log(
        `Router Context: Navigating from ${currentRoute} to ${route}`
      );

      if (route === currentRoute) {
        console.log(
          `Router Context: Already on route ${route}, skipping navigation`
        );
        return;
      }

      // 更新状态
      setCurrentRoute(route);
      setHistory((prev) => [...prev, route]);

      // 更新URL
      window.history.pushState({ route }, "", `/${route}`);

      console.log(
        `Router Context: Navigation to ${route} completed, URL updated`
      );
    },
    [currentRoute]
  );

  const goBack = useCallback(() => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousRoute = newHistory[newHistory.length - 1];

      setHistory(newHistory);
      setCurrentRoute(previousRoute);
      window.history.back();
    }
  }, [history]);

  const value = {
    currentRoute,
    navigate,
    goBack,
  };

  return (
    <RouterContext.Provider value={value}>{children}</RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextType => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return context;
};
