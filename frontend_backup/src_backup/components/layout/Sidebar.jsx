import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  Gavel,
  List,
  BarChart3,
  Trophy,
  Settings,
  Sliders,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { ROUTES, NAV_ITEMS, APP_NAME } from "../../utils/constants";
import { cn } from "../ui/utils";

const iconMap = {
  LayoutDashboard,
  PlusCircle,
  Gavel,
  List,
  BarChart3,
  Trophy,
  Settings,
  Sliders,
};

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-navy-800 border-r border-navy-700 transform transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        "lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:border-r-0",
      )}
      aria-label="Sidebar"
    >
      <div className="flex items-center justify-between h-16 px-6 border-b border-navy-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-glow">
            <Zap className="w-4 h-4 text-navy-900" />
          </div>
          <span className="font-bold tracking-tight text-slate-100">
            {collapsed ? "O" : APP_NAME}
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-200"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-navy-700/50",
              )}
            >
              <Icon className="w-5 h-5" />
              {collapsed ? null : item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-navy-900/50 border border-navy-700/50">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-cyan-400">
            DU
          </div>
          <div className={collapsed ? "hidden" : "flex-1 min-w-0"}>
            <p className="text-sm font-medium text-slate-100 truncate">Demo User</p>
            <p className="text-xs text-slate-500 truncate">Auctioneer</p>
          </div>
        </div>
      </div>

      {collapsed && (
        <div className="absolute bottom-4 left-4 w-8 h-8 rounded-lg bg-navy-700 border border-navy-600 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors" title="Expand">
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;