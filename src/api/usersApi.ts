import { realApiClient } from "@/lib/realApiClient";
import type { User } from "@/types";

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
  city?: string;
  district?: string;
  detail?: string;
  gender?: string;
  dob?: string;
  active?: boolean;
  avatarUrl?: string;
  role?: string;
}

interface BePageResponse<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}
interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
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

function joinAddress(u: BeUserResponse): string | undefined {
  const parts = [u.detail, u.district, u.city].filter(Boolean);
  return parts.length ? parts.join(", ") : u.address;
}

function mapBeUser(u: BeUserResponse): User {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: mapBeRole(u.role),
    avatarUrl: u.avatarUrl ?? undefined,
    phone: u.phoneNumber,
    address: joinAddress(u),
  };
}

// BE: GET /api/users?page&size&role (ADMIN) → ApiResponse<PageResponse<UserResponse>>
export async function getUsers(role?: string): Promise<User[]> {
  try {
    const { data } = await realApiClient.get<
      BeApiResponse<BePageResponse<BeUserResponse>>
    >("/users", { params: { page: 1, size: 200, role } });
    return (data?.data?.data ?? []).map(mapBeUser);
  } catch {
    return [];
  }
}

// BE: PUT /api/users/{id}/status?isBlocked= (ADMIN) — khoá/mở tài khoản
export async function updateUserStatus(
  userId: string,
  isBlocked: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.put(`/users/${userId}/status`, null, {
      params: { isBlocked },
    });
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể cập nhật trạng thái người dùng";
    return { ok: false, error: msg };
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
