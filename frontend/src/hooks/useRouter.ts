/**
 * Simple Router Hook - 简单路由管理
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

export const useRouter = (): RouterState => {
  const [currentRoute, setCurrentRoute] = useState<Route>("dashboard");
  const [history, setHistory] = useState<Route[]>(["dashboard"]);

  useEffect(() => {
    // Listen for browser back/forward buttons
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) as Route;
      if (path) {
        setCurrentRoute(path || "dashboard");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = (route: Route) => {
    setCurrentRoute(route);
    setHistory((prev) => [...prev, route]);

    // Update browser URL without page reload
    window.history.pushState({}, "", `/${route}`);
  };

  const goBack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      const previousRoute = newHistory[newHistory.length - 1];

      setHistory(newHistory);
      setCurrentRoute(previousRoute);
      window.history.back();
    }
  };

  return {
    currentRoute,
    navigate,
    goBack,
  };
};
