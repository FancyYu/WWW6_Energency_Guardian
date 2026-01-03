/**
 * App Component - 主应用组件
 */

import { Layout, Dashboard, GuardianDashboard } from "./components/Dashboard";
import { useCurrentRole } from "./store";
import "./index.css";

function App() {
  const currentRole = useCurrentRole();

  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        {currentRole === "protected_user" ? (
          <Dashboard />
        ) : (
          <GuardianDashboard />
        )}
      </Layout>
    </div>
  );
}

export default App;
