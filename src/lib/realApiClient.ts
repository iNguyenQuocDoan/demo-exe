import axios from "axios";
import { getGuestToken } from "./guestToken";

const REAL_BASE_URL =
  process.env.NEXT_PUBLIC_REAL_API_URL ?? "/api/be";

export const realApiClient = axios.create({
  baseURL: REAL_BASE_URL,
  timeout: 15000,
});

realApiClient.interceptors.request.use(async (config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  if (typeof window !== "undefined") {
    // User đã đăng nhập → token của họ. Chưa đăng nhập → guest token read-only
    // để catalog công khai (gia sư, môn học, tỉnh/quận) vẫn hiển thị dữ liệu thật.
    let token = localStorage.getItem("auth_token");
    if (!token) token = await getGuestToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

realApiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err?.config as
      | (import("axios").InternalAxiosRequestConfig & { __retried?: boolean })
      | undefined;
    const status = err?.response?.status as number | undefined;
    const isGet = (config?.method ?? "get").toLowerCase() === "get";
    // Render free-tier hay 500/đứt kết nối tạm thời cho endpoint nặng (JOIN) —
    // retry GET 1 lần (idempotent) khi network-error HOẶC 5xx. Không retry POST/PUT.
    const retriable = !err.response || (status !== undefined && status >= 500);
    if (config && isGet && retriable && !config.__retried) {
      config.__retried = true;
      await new Promise((r) => setTimeout(r, 600));
      return realApiClient(config);
    }
    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(err);
  },
);
