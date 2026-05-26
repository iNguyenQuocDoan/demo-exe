import { realApiClient } from "@/lib/realApiClient";
import type { User } from "@/types";

// BE chưa expose list users — trả mảng rỗng (admin user-management dùng mock)
export async function getUsers(): Promise<User[]> {
  return [];
}

interface BeUpdateProfilePayload {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dOB?: string;
}

interface BeUserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  dob?: string;
  role?: string;
}

function mapBeRole(role?: string): User["role"] {
  switch ((role ?? "").toUpperCase()) {
    case "PARENT":
      return "parent";
    case "TUTOR":
      return "tutor";
    case "ADMIN":
      return "admin";
    default:
      return "parent";
  }
}

// BE: PUT /api/users/profile (multipart) — phần `data` JSON + `avatar` file optional
export async function updateSelf(
  _userId: string,
  fields: { phone?: string; address?: string; fullName?: string; avatarFile?: File },
): Promise<User> {
  const form = new FormData();
  const payload: BeUpdateProfilePayload = {};
  if (fields.fullName != null) payload.fullName = fields.fullName;
  if (fields.phone != null) payload.phoneNumber = fields.phone;
  if (fields.address != null) payload.address = fields.address;
  form.append(
    "data",
    new Blob([JSON.stringify(payload)], { type: "application/json" }),
  );
  if (fields.avatarFile) form.append("avatar", fields.avatarFile);

  const { data } = await realApiClient.put<{
    code: number;
    message: string;
    success: boolean;
    data: BeUserResponse;
  }>("/users/profile", form);
  const u = data.data;
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: mapBeRole(u.role),
    phone: u.phoneNumber,
    address: u.address,
  };
}
