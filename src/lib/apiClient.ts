import axios from "axios";
import { isMock } from "./isMock";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// ── Mock adapter ─────────────────────────────────────────────────────────────
// When NEXT_PUBLIC_USE_MOCK=true, intercept every request and route to mock handlers.
if (isMock) {
  apiClient.defaults.adapter = async (config) => {
    // Lazy-import to avoid loading mock code in production
    const { routeMockRequest } = await import("@/mock/router");
    let result;
    try {
      result = routeMockRequest({
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
      });
    } catch (err) {
      // Handler threw — surface as 500 so API catch blocks can inspect it
      return Promise.reject({
        response: { status: 500, data: { ok: false, error: String(err) }, headers: {}, config },
        config,
        isAxiosError: true,
      });
    }

    if (result === null) {
      // Unhandled route — return empty 200
      return { data: { ok: true }, status: 200, statusText: "OK", headers: {}, config, request: {} };
    }

    if (result.status >= 400) {
      // Reject like a real axios error so catch blocks work
      return Promise.reject({
        response: { status: result.status, data: result.data, headers: {}, config },
        config,
        isAxiosError: true,
      });
    }

    return { data: result.data, status: result.status, statusText: "OK", headers: {}, config, request: {} };
  };
}

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
