import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, ChevronDown, Zap } from "lucide-react";
import { cn } from "../ui/utils";

const Topbar = ({ onMenuToggle }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="h-16 bg-navy-800/50 backdrop-blur border-b border-navy-700 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-slate-400 hover:text-slate-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-navy-900" />
          </div>
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            OptiBiD
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search auctions, bids..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-navy-600 bg-navy-900 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-navy-700 hover:text-slate-200 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-navy-700 flex items-center justify-center text-cyan-400">
              DU
            </div>
            <span className="text-sm font-medium text-slate-100 hidden md:block">Demo User</span>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-navy-800 border border-navy-600 rounded-xl shadow-xl py-2">
              <div className="px-4 py-2 text-xs text-slate-500 uppercase font-medium">Demo Account</div>
              <div className="px-4 py-2 border-b border-navy-700">
                <p className="text-sm font-medium text-slate-100">Demo User</p>
                <p className="text-xs text-slate-500">Auctioneer</p>
              </div>
              <div className="px-4 py-2">
                <button
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full text-left text-sm text-slate-300 hover:bg-navy-700 hover:text-cyan-400 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Topbar.displayName = "Topbar";
export default Topbar;