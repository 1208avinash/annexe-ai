import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext.jsx";

const DEFAULT_EMAIL = "admin@annexe.ai";
const DEFAULT_PASSWORD = "Admin123!";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      const destination = location.state?.from || "/";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <p className="eyebrow">Enterprise CRM</p>
        <h1>Sign in to your workspace</h1>
        <p className="auth-copy">
          Access the seeded dashboard, protected customer records, and the full CRM shell.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="helper-text">
          Default credentials: <strong>{DEFAULT_EMAIL}</strong> / <strong>{DEFAULT_PASSWORD}</strong>
        </p>
      </section>
    </main>
  );
}
