import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { apiClient } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await apiClient.summary();
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || LOCALIZATION.frontend.unableToLoadDashboard);
        }
      }
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="content-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">{LOCALIZATION.screens.dashboard}</p>
          <h2>{LOCALIZATION.frontend.welcomeBack}, {user?.full_name ?? "Admin"}.</h2>
          <p>{LOCALIZATION.frontend.monitorCRMActivity}</p>
        </div>
        <Link className="button button-primary" to="/customers">
          {LOCALIZATION.frontend.openCustomers}
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label={LOCALIZATION.uiLabels.customers} value={summary?.customer_count ?? "..."} note={LOCALIZATION.frontend.totalAccounts} />
        <StatCard
          label={LOCALIZATION.frontend.active}
          value={summary?.active_customer_count ?? "..."}
          note={LOCALIZATION.frontend.currentlyActiveAccounts}
        />
        <StatCard label={LOCALIZATION.frontend.users} value={summary?.user_count ?? "..."} note={LOCALIZATION.frontend.seededUsers} />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.modules}</h3>
          <span>{summary?.modules?.length ?? 0} {LOCALIZATION.frontend.enabledModules}</span>
        </div>
        <div className="chip-row">
          {(summary?.modules ?? []).map((moduleName) => (
            <span className="chip" key={moduleName}>
              {moduleName}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.recentCustomers}</h3>
          <span>{summary?.recent_customers?.length ?? 0} {LOCALIZATION.frontend.totalRecords}</span>
        </div>
        <div className="recent-list">
          {(summary?.recent_customers ?? []).map((customer) => (
            <Link className="recent-item" to={"/customers/" + customer.id} key={customer.id}>
              <strong>{customer.name}</strong>
              <span>
                {customer.company ?? LOCALIZATION.frontend.unknownCompany} · {customer.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
