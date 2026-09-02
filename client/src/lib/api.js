const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

export const api = {
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password }, }),

  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  forgotPassword: (email) =>
    request("/auth/forgot-password", { method: "POST", body: { email } }),

  resetPassword: (token, password) =>
    request("/auth/reset-password", { method: "POST", body: { token, password } }),

  me: (token) => request("/auth/me", { token }),

  updateNotifications: (token, settings) =>
    request("/auth/notifications", { method: "PATCH", body: settings, token }),

  listEndpoints: (token) => request("/endpoints", { token }),

  createEndpoint: (token, data) =>
    request("/endpoints", { method: "POST", body: data, token }),

  getEndpoint: (token, id) => request(`/endpoints/${id}`, { token }),

  deleteEndpoint: (token, id) =>
    request(`/endpoints/${id}`, { method: "DELETE", token }),

  checkNow: (token, id) =>
    request(`/endpoints/${id}/check-now`, { method: "POST", token }),

  listChecks: (token, id) => request(`/endpoints/${id}/checks`, { token }),

  getCheckDiff: (token, id, checkId) =>
    request(`/endpoints/${id}/diff/${checkId}`, { token }),

  updateEndpoint: (token, id, data) =>
    request(`/endpoints/${id}`, { method: "PATCH", body: data, token }),

  resetBaseline: (token, id) =>
    request(`/endpoints/${id}/reset-baseline`, { method: "POST", token }),

  getBaseline: (token, id) => request(`/endpoints/${id}/baseline`, { token }),
};
