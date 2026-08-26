import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { apiClient } from "../services/api.js";
import { LOCALIZATION, formatLocalizedDate } from "../localization/index.js";

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
          setError(err.message || LOCALIZATION.frontend.unableToLoadCustomer);
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
            {LOCALIZATION.frontend.backToCustomers}
          </Link>
        </div>
      </section>
    );
  }

  if (!customer) {
    return (
      <section className="content-stack">
        <div className="panel">{LOCALIZATION.frontend.loadingCustomerProfile}</div>
      </section>
    );
  }

  return (
    <section className="content-stack">
      <div className="hero-card">
        <div>
          <p className="eyebrow">{LOCALIZATION.frontend.customerProfile}</p>
          <h2>{customer.name}</h2>
          <p>{customer.company ?? LOCALIZATION.frontend.noCompanyProvided}</p>
        </div>
        <Link className="button button-secondary" to="/customers">
          {LOCALIZATION.frontend.backToCustomers}
        </Link>
      </div>

      <section className="panel">
        <div className="panel-header">
          <h3>{LOCALIZATION.frontend.customerProfile}</h3>
          <span className={"status-pill status-" + customer.status}>{customer.status}</span>
        </div>
        <dl className="detail-grid">
          <div>
            <dt>Email</dt>
            <dd>{customer.email ?? LOCALIZATION.frontend.notProvided}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{customer.phone ?? LOCALIZATION.frontend.notProvided}</dd>
          </div>
          <div>
            <dt>Owner</dt>
            <dd>{customer.owner ?? LOCALIZATION.frontend.unassigned}</dd>
          </div>
          <div>
            <dt>{LOCALIZATION.frontend.created}</dt>
            <dd>{formatLocalizedDate(customer.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="panel">
        <h3>{LOCALIZATION.frontend.notes}</h3>
        <p>{customer.notes ?? LOCALIZATION.frontend.noNotes}</p>
      </section>
    </section>
  );
}
