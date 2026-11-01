import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuction } from "./context/AuctionContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import CreateAuction from "./pages/CreateAuction";
import PlaceBid from "./pages/PlaceBid";
import BidHistory from "./pages/BidHistory";
import StrategyAnalysis from "./pages/StrategyAnalysis";
import AuctionResults from "./pages/AuctionResults";
import ManageAuction from "./pages/ManageAuction";
import Settings from "./pages/Settings";
import { ROUTES } from "./utils/constants";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import Toast from "./components/ui/Toast";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mockMode } = useAuction();

  return (
    <div className="flex h-screen bg-navy-900 text-slate-100">
      <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="flex-1 overflow-hidden relative">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div
          className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-200 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onClick={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-h-full p-6">
          <Routes>
            <Route path={ROUTES.HOME} element={<Home />} />
            <Route
              path="/app/*"
              element={
                <div className="flex h-full">
                  <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="flex-1 overflow-hidden relative">
                    <div className="absolute inset-0 z-20 bg-black/40 transition-opacity duration-200">
                      {sidebarOpen ? (
                        <div className="absolute inset-0 opacity-100 pointer-events-auto" onClick={() => setSidebarOpen(false)} />
                      ) : (
                        <div className="absolute inset-0 opacity-0 pointer-events-none" />
                      )}
                    </div>
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="create-auction" element={<CreateAuction />} />
                      <Route path="place-bid" element={<PlaceBid />} />
                      <Route path="bid-history" element={<BidHistory />} />
                      <Route path="strategy-analysis" element={<StrategyAnalysis />} />
                      <Route path="auction-results" element={<AuctionResults />} />
                      <Route path="manage-auction" element={<ManageAuction />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="" element={<Navigate to="/app/dashboard" replace />} />
                    </Routes>
                  </div>
                </div>
              }
            />
            <Route path="/" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {mockMode && (
          <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded-full text-amber-200 text-xs font-medium backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            MOCK MODE — C++ backend not yet connected
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}

export default App;
