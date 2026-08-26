import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";
import { LOCALIZATION } from "../localization/index.js";

export function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">A</span>
          <div>
            <strong>Enterprise CRM</strong>
            <p>{LOCALIZATION.screens.dashboard}</p>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            {LOCALIZATION.screens.dashboard}
          </NavLink>
          <NavLink to="/customers">{LOCALIZATION.screens.customers}</NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>{user?.full_name}</p>
          <button type="button" className="button button-secondary" onClick={handleLogout}>
            {LOCALIZATION.frontend.signOut}
          </button>
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">ANNEXE AI</p>
            <h1>Enterprise CRM</h1>
          </div>
          <div className="status-pill">{LOCALIZATION.frontend.authenticated}</div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
