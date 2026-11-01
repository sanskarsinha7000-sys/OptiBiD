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
  X,
  Zap,
} from "lucide-react";
import { NAV_ITEMS, APP_NAME } from "../../utils/constants";
import { cn } from "../ui/utils";

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  PlusCircle: PlusCircle,
  Gavel: Gavel,
  List: List,
  BarChart3: BarChart3,
  Trophy: Trophy,
  Settings: Settings,
  Sliders: Sliders,
};

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  const isActive = (href) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <aside
      className={cn("app-sidebar", open && "app-sidebar-open")}
      aria-label="Sidebar"
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <Zap aria-hidden="true" />
        </div>
        <div className="sidebar-brand-copy">
          <span className="sidebar-brand-name">{APP_NAME}</span>
          <span className="sidebar-brand-caption">SMART AUCTION</span>
        </div>
        <button
          onClick={onClose}
          className="sidebar-close"
          aria-label="Close sidebar"
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar-section-label">WORKSPACE</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon];
          const href = `/app${item.href}`;
          const active = isActive(href);

          return (
            <Link
              key={item.name}
              to={href}
              onClick={onClose}
              className={cn("sidebar-link", active && "sidebar-link-active")}
            >
              <Icon aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-profile">
        <div className="profile-avatar">DU</div>
        <div className="profile-copy">
          <span className="profile-name">Demo User</span>
          <span className="profile-role">Auctioneer</span>
        </div>
        <span className="profile-status" aria-label="Online" />
      </div>
    </aside>
  );
};

Sidebar.displayName = "Sidebar";
export default Sidebar;
