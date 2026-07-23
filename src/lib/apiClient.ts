import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://liflow-be.onrender.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ── Real interceptors ─────────────────────────────────────────────────────────

// Attach JWT on every request and handle Content-Type for FormData
apiClient.interceptors.request.use((config) => {
  // Set Content-Type to application/json by default, unless it's FormData
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401 → clear token (redirect handled by AuthProvider)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(err);
  },
);

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}
