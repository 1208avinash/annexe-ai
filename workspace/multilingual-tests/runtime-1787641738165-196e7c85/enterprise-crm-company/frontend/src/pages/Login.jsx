import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { LanguageSelector } from "../components/LanguageSelector.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { LOCALIZATION } from "../localization/index.js";

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
      setError(err.message || LOCALIZATION.frontend.unableToSignIn);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="auth-card-header">
          <p className="eyebrow">{LOCALIZATION.screens.login}</p>
          <LanguageSelector />
        </div>
        <h1>Enterprise CRM</h1>
        <p className="auth-copy">
          {LOCALIZATION.buttons.enter}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            {LOCALIZATION.frontend.email}
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            {LOCALIZATION.frontend.password}
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? LOCALIZATION.frontend.signInProgress : LOCALIZATION.frontend.signIn}
          </button>
        </form>

        <p className="helper-text">
          {LOCALIZATION.frontend.defaultCredentials}: <strong>{DEFAULT_EMAIL}</strong> / <strong>{DEFAULT_PASSWORD}</strong>
        </p>
      </section>
    </main>
  );
}
