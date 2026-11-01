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
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mockMode } = useAuction();

  return (
    <div className="app-backdrop">
      <div className="app-frame">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <button
            className="app-sidebar-backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          />
        )}
        <Topbar
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
          mockMode={mockMode}
        />
        <main className="app-main">
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
            <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
          </Routes>
        </main>
        {mockMode && (
          <span className="sr-only">Mock data mode</span>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/*" element={<AppLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
