
import { Outlet } from 'react-router-dom';
import {
  Search,
  Bell,
  Grid2X2,
  ScanLine,
} from 'lucide-react';
import './AppLayout.css';

export default function AppLayout() {
  return (
    <div className="app-layout app-main">
      <header className="top-header">
        <div className="header-search">
          <Search size={17} color="#8291A5" />

          <input
            type="text"
            placeholder="Rechercher un véhicule, un badge, une transaction..."
            aria-label="Rechercher"
          />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="header-icon-btn notification-btn"
            aria-label="Notifications"
          >
            <Bell size={19} />
            <span className="notification-dot" />
          </button>

          <button
            type="button"
            className="header-icon-btn"
            aria-label="Applications"
          >
            <Grid2X2 size={19} />
          </button>

          <div className="header-divider" />

          <div className="admin-profile">
            <div className="admin-avatar">AD</div>

            <div className="admin-info">
              <span className="admin-name">
                Ahmed DOUKKALI
              </span>
              <span className="admin-role">
                Administrateur
              </span>
            </div>
          </div>

          <button
            type="button"
            className="header-icon-btn scan-btn"
            aria-label="Scanner"
          >
            <ScanLine size={21} />
          </button>
        </div>
      </header>

      {/* Pages */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
