import { apiClient } from "@/lib/apiClient";
import type { User } from "@/types";

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<{ ok: boolean; users: User[] }>("/users");
  return data.users;
}

export async function updateSelf(userId: string, fields: { phone?: string; address?: string; fullName?: string }): Promise<User> {
  const { data } = await apiClient.put<{ ok: boolean; user: User }>(`/users/${userId}`, fields);
  return data.user;
}
