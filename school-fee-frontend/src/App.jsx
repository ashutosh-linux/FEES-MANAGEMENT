import { useState, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import FeeStructures from "./pages/FeeStructures";
import Bills from "./pages/Bills";
import { API_BASE_URL, healthAPI } from "./services/api";
import { Toaster } from "react-hot-toast";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  // Check backend health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await healthAPI.check();
        const isHealthy =
          response.data?.success === true ||
          response.data?.database === "connected" ||
          response.status === 200;
        setDbConnected(Boolean(isHealthy));
      } catch (err) {
        console.error("Backend health check failed:", err);
        setDbConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkHealth();
  }, []);

  const renderPage = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "students":
        return <Students />;
      case "fee-structures":
        return <FeeStructures />;
      case "bills":
        return <Bills />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Global Toast Notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-8">
            {/* Backend Connectivity Warning */}
            {!isChecking && !dbConnected && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
                <div className="text-yellow-600 dark:text-yellow-400 flex-shrink-0">
                  ⚠️
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-400">
                    Database Connection Issue
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    The backend API is not accessible. Check that this API is reachable:{" "}
                    <span className="font-mono">{API_BASE_URL}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Page Content */}
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;