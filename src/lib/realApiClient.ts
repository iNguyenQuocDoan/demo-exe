import axios from "axios";

const REAL_BASE_URL =
  process.env.NEXT_PUBLIC_REAL_API_URL ?? "/api/be";

export const realApiClient = axios.create({
  baseURL: REAL_BASE_URL,
  timeout: 15000,
});

realApiClient.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

realApiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(err);
  },
);
