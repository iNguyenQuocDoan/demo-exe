import { apiClient, setAuthToken } from "@/lib/apiClient";
import type { User } from "@/types";

export async function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const { data } = await apiClient.post<{
      ok: boolean;
      token: string;
      user: User;
    }>("/auth/login", {
      email,
      password,
    });
    setAuthToken(data.token);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    }
    return { ok: true, user: data.user };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Đăng nhập thất bại";
    return { ok: false, error: msg };
  }
}

export async function register(data: {
  fullName: string;
  email: string;
  password: string;
  role?: string;
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const { data: res } = await apiClient.post<{
      ok: boolean;
      token: string;
      user: User;
    }>("/auth/register", data);
    setAuthToken(res.token);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(res.user));
    }
    return { ok: true, user: res.user };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? "Đăng ký thất bại";
    return { ok: false, error: msg };
  }
}

export async function updateUserRole(
  userId: string,
  newRole: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await apiClient.put(`/users/${userId}`, { role: newRole });
    return { ok: true };
  } catch {
    return { ok: false, error: "Không thể cập nhật vai trò" };
  }
}

export async function logout(): Promise<void> {
  setAuthToken(null);
}

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await apiClient.get<{ ok: boolean; user: User }>(
      "/auth/me",
    );
    return data.user;
  } catch {
    return null;
  }
}

// Restores user from localStorage on mount and verifies token
export function listenAuthState(cb: (user: User | null) => void): () => void {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");

    if (stored && token) {
      try {
        // First restore from localStorage immediately
        const user = JSON.parse(stored) as User;
        cb(user);

        // Then verify token is still valid by calling /auth/me
        getMe()
          .then((verifiedUser) => {
            if (verifiedUser) {
              // Update with fresh user data from server
              localStorage.setItem("auth_user", JSON.stringify(verifiedUser));
              cb(verifiedUser);
            } else {
              // Token invalid, logout
              setAuthToken(null);
              cb(null);
            }
          })
          .catch(() => {
            // Network error or token expired
            setAuthToken(null);
            cb(null);
          });
      } catch {
        cb(null);
      }
    } else {
      cb(null);
    }
  } else {
    cb(null);
  }
  return () => {};
}
