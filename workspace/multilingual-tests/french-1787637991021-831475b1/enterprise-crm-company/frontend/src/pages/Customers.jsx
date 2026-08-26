import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      try {
        const data = await apiClient.listCustomers();
        if (active) {
          setCustomers(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load customers");
        }
      }
    }

    loadCustomers();

    return () => {
      active = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter((customer) => {
      return [customer.name, customer.company, customer.email, customer.owner]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term));
    });
  }, [customers, query]);

  return (
    <section className="content-stack">
      <div className="panel">
        <div className="panel-header">
          <h2>{LOCALIZATION.frontend.customerList}</h2>
          <span>{filteredCustomers.length} {LOCALIZATION.frontend.visibleCustomers}</span>
        </div>
        <input
          className="search-input"
          placeholder={LOCALIZATION.frontend.searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="customer-grid">
        {filteredCustomers.map((customer) => (
          <article className="customer-card" key={customer.id}>
            <div className="customer-card-header">
              <div>
                <h3>{customer.name}</h3>
                <p>{customer.company ?? "Independent account"}</p>
              </div>
              <span className={"status-pill status-" + customer.status}>{customer.status}</span>
            </div>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{customer.email ?? "Not provided"}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{customer.owner ?? "Unassigned"}</dd>
              </div>
            </dl>
            <Link className="button button-secondary" to={"/customers/" + customer.id}>
              {LOCALIZATION.frontend.viewDetails}
            </Link>
          </article>
          ))}
      </div>
    </section>
  );
}
