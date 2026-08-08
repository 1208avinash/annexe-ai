import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../services/api.js";

export default function CustomerDetails() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      try {
        const data = await apiClient.getCustomer(customerId);
        if (active) {
          setCustomer(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load customer");
        }
      }
    }

    loadCustomer();

    return () => {
      active = false;
    };
  }, [customerId]);

  if (error) {
    return (
      <section className="content-stack">
        <div className="panel">
          <p className="form-error">{error}</p>
          <Link className="button button-secondary" to="/customers">
            Back to customers
          </Link>
        </div>
      </section>
    );
  }

  if (!customer) {
    return (
      <section className="content-stack">
        <div className="panel">Loading customer profile...</div>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">Customer profile</p>
          <h2>{customer.name}</h2>
          <p>{customer.company ?? "No company provided"}</p>
        </div>
        <Link className="button button-secondary" to="/customers">
          Back to customers
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>Details</h3>
          <span className={"status-pill status-" + customer.status}>{customer.status}</span>
        </div>
        <dl className="detail-grid">
          <div>
            <dt>Email</dt>
            <dd>{customer.email ?? "Not provided"}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{customer.phone ?? "Not provided"}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{customer.owner ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{new Date(customer.created_at).toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h3>Notes</h3>
        <p>{customer.notes ?? "No notes available for this customer."}</p>
      </section>
    </section>
  );
}
