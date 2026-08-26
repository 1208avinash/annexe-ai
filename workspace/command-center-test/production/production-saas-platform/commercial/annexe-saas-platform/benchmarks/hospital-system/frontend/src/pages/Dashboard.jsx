import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { StatCard } from "../components/StatCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { apiClient } from "../services/api.js";

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
          setError(err.message || "Unable to load dashboard");
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
          <p className="eyebrow">Workspace overview</p>
          <h2>Welcome back, {user?.full_name ?? "Admin"}.</h2>
          <p>Monitor customer engagement, active accounts, and recent CRM activity.</p>
        </div>
        <Link className="button button-primary" to="/customers">
          Open customers
        </Link>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Customers" value={summary?.customer_count ?? "..."} note="Total accounts" />
        <StatCard
          label="Active"
          value={summary?.active_customer_count ?? "..."}
          note="Currently active accounts"
        />
        <StatCard label="Users" value={summary?.user_count ?? "..."} note="Seeded users" />
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Modules</h3>
          <span>{summary?.modules?.length ?? 0} enabled modules</span>
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
          <h3>Recent customers</h3>
          <span>{summary?.recent_customers?.length ?? 0} records</span>
        </div>
        <div className="recent-list">
          {(summary?.recent_customers ?? []).map((customer) => (
            <Link className="recent-item" to={"/customers/" + customer.id} key={customer.id}>
              <strong>{customer.name}</strong>
              <span>
                {customer.company ?? "Unknown company"} · {customer.status}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
