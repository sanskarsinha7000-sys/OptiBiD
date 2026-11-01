import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, Search, ChevronDown, Settings } from "lucide-react";

const Topbar = ({ onMenuToggle, mockMode }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="app-topbar">
      <div className="topbar-welcome">
        <button
          onClick={onMenuToggle}
          className="topbar-menu-button"
          aria-label="Toggle menu"
        >
          <Menu aria-hidden="true" />
        </button>
        <div>
          <p className="topbar-eyebrow">WELCOME BACK, AUCTIONEER</p>
          <p className="topbar-title">Your auction workspace</p>
        </div>
      </div>

      <div className="topbar-actions">
        <label className="topbar-search">
          <Search aria-hidden="true" />
          <input type="search" placeholder="Search auctions and bids" aria-label="Search auctions and bids" />
          <kbd>⌘ K</kbd>
        </label>
        {mockMode && <span className="mock-mode-chip">DEMO DATA</span>}

        <div className="topbar-account">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="account-trigger"
            aria-label="User menu"
            aria-expanded={userMenuOpen}
          >
            <span className="account-avatar">DU</span>
            <span className="account-name"><strong>Demo User</strong><small>Auctioneer</small></span>
            <ChevronDown aria-hidden="true" />
          </button>

          {userMenuOpen && (
            <div className="account-menu">
              <p>DEMO ACCOUNT</p>
              <Link to="/app/settings" onClick={() => setUserMenuOpen(false)}>
                <Settings aria-hidden="true" />
                Account settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

Topbar.displayName = "Topbar";
export default Topbar;