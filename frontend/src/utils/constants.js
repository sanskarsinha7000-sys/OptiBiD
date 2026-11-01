export const APP_NAME = "OptiBiD";
export const APP_TAGLINE = "Every Bid Counts. Every Decision Matters.";
export const APP_DESCRIPTION = "Smart Auction System with Greedy-Based Bid Optimization";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE !== "false";

export const UTILITY_WEIGHTS = {
  price: 0.7,
  time: 0.3,
};

export const EPSILON = 1e-9;

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  CREATE_AUCTION: "/create-auction",
  PLACE_BID: "/place-bid",
  BID_HISTORY: "/bid-history",
  STRATEGY_ANALYSIS: "/strategy-analysis",
  AUCTION_RESULTS: "/auction-results",
  MANAGE_AUCTION: "/manage-auction",
  SETTINGS: "/settings",
};

export const NAV_ITEMS = [
  { name: "Dashboard", href: ROUTES.DASHBOARD, icon: "LayoutDashboard" },
  { name: "Create Auction", href: ROUTES.CREATE_AUCTION, icon: "PlusCircle" },
  { name: "Place Bid", href: ROUTES.PLACE_BID, icon: "Gavel" },
  { name: "Bid History", href: ROUTES.BID_HISTORY, icon: "List" },
  { name: "Strategy Analysis", href: ROUTES.STRATEGY_ANALYSIS, icon: "BarChart3" },
  { name: "Auction Results", href: ROUTES.AUCTION_RESULTS, icon: "Trophy" },
  { name: "Manage Auction", href: ROUTES.MANAGE_AUCTION, icon: "Settings" },
  { name: "Settings", href: ROUTES.SETTINGS, icon: "Sliders" },
];

export const DEMO_USER = {
  name: "Demo User",
  role: "Auctioneer",
  avatar: null,
};