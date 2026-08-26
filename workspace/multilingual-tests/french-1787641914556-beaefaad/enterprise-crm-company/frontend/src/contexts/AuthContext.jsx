import { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { apiClient, clearStoredToken, getStoredToken, setStoredToken } from "../services/api.js";
import { LOCALIZATION } from "../localization/index.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      if (!token) {
        setReady(true);
        return;
      }

      try {
        const me = await apiClient.me(token);
        if (active) {
          setUser(me);
        }
      } catch {
        clearStoredToken();
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, [token]);

  async function login(email, password) {
    const response = await apiClient.login({ email, password });
    setStoredToken(response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children }) {
  const { token, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return <div className="screen screen-loading">{LOCALIZATION.frontend.loadingWorkspace}</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
