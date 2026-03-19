import { db } from "../db";
import type { User } from "@/types";

function currentUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}

export function handleLogin(body: { email?: string; password?: string }) {
  const { email = "", password = "" } = body;
  const found = db.rawUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) return { status: 401, data: { ok: false, error: "Email hoặc mật khẩu không đúng" } };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = found;
  db.getOrCreateWallet(found.id);
  return { status: 200, data: { ok: true, token: `mock_${found.id}`, user } };
}

export function handleRegister(body: { fullName?: string; email?: string; password?: string; role?: string }) {
  const { fullName = "", email = "", password = "", role = "guest" } = body;
  if (!fullName || !email || !password)
    return { status: 400, data: { ok: false, error: "fullName, email, password là bắt buộc" } };
  if (db.rawUsers.some((u) => u.email.toLowerCase() === email.toLowerCase()))
    return { status: 400, data: { ok: false, error: "Email đã được sử dụng" } };

  const id = `u_${Date.now()}`;
  const newUser = {
    id, fullName, email: email.toLowerCase(), password,
    role: role as User["role"],
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
  };
  db.rawUsers.push(newUser);
  db.getOrCreateWallet(id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _pw, ...user } = newUser;
  return { status: 201, data: { ok: true, token: `mock_${id}`, user } };
}

export function handleGetMe() {
  const user = currentUser();
  if (!user) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  // Return fresh copy from db (role may have changed)
  const fresh = db.getUser(user.id);
  return { status: 200, data: { ok: true, user: fresh ?? user } };
}

export function handleUpdateUserRole(userId: string, body: { role?: string }) {
  const u = db.rawUsers.find((u) => u.id === userId);
  if (!u) return { status: 404, data: { ok: false, error: "User not found" } };
  if (body.role) u.role = body.role as User["role"];
  return { status: 200, data: { ok: true, user: db.getUser(userId) } };
}
