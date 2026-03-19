import { db } from "../db";
import type { User } from "@/types";

export function handleGetUsers(params: Record<string, string>) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(params.limit) || 50));
  let users = db.getUsers();
  if (params.role) users = users.filter((u) => u.role === params.role);
  if (params.search) {
    const q = params.search.toLowerCase();
    users = users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }
  const total = users.length;
  const paged = users.slice((page - 1) * limit, page * limit);
  return { status: 200, data: { ok: true, users: paged, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } } };
}

export function handleGetUser(userId: string) {
  const user = db.getUser(userId);
  if (!user) return { status: 404, data: { ok: false, error: "User not found" } };
  return { status: 200, data: { ok: true, user } };
}

export function handleUpdateUser(userId: string, body: Partial<User>) {
  const u = db.rawUsers.find((u) => u.id === userId);
  if (!u) return { status: 404, data: { ok: false, error: "User not found" } };
  Object.assign(u, body);
  return { status: 200, data: { ok: true, user: db.getUser(userId) } };
}
