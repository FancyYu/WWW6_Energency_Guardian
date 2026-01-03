/**
 * App Component - 主应用组件
 */

import { Layout, Dashboard } from "./components/Dashboard";
import "./index.css";

function App() {
  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
}

export default App;
