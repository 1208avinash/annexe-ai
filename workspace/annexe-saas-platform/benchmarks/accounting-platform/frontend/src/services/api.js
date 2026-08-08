const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "annexe.crm.token";

export function getStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const {
    method = "GET",
    body,
    token = undefined,
    headers = {}
  } = options;

  const authToken = token === undefined ? getStoredToken() : token;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "Request failed");
  }

  return payload;
}

export const apiClient = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: credentials,
      token: null
    });
  },
  me(token) {
    return request("/auth/me", { token });
  },
  summary(token) {
    return request("/crm/summary", { token });
  },
  listCustomers(token) {
    return request("/customers", { token });
  },
  getCustomer(customerId, token) {
    return request(`/customers/${customerId}`, { token });
  },
  createCustomer(payload, token) {
    return request("/customers", {
      method: "POST",
      body: payload,
      token
    });
  },
  updateCustomer(customerId, payload, token) {
    return request(`/customers/${customerId}`, {
      method: "PUT",
      body: payload,
      token
    });
  },
  deleteCustomer(customerId, token) {
    return request(`/customers/${customerId}`, {
      method: "DELETE",
      token
    });
  }
};
