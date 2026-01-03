/**
 * App Component - 主应用组件
 */

import { Layout, Dashboard } from "./components/Dashboard";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Layout>
        <Dashboard />
      </Layout>
    </div>
  );
}

export default App;
