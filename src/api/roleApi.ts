import { realApiClient } from "@/lib/realApiClient";

// ── BE response shapes ────────────────────────────────────────────────────────
export interface Permission {
  name: string;
  description?: string;
}

export interface RoleDto {
  id?: string;
  name: string;
  description?: string;
  permissions?: Permission[];
}

export interface PermissionDescriptor {
  name: string;
  description?: string;
  checked: boolean;
}

export interface PermissionGroup {
  module: string;
  permissions: PermissionDescriptor[];
}

interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissions?: string[];
}

// BE: POST /api/roles (ADMIN với quyền ROLE_MANAGE)
export async function createRole(
  input: CreateRoleInput,
): Promise<{ ok: boolean; role?: RoleDto; error?: string }> {
  try {
    const { data } = await realApiClient.post<BeApiResponse<RoleDto>>("/roles", {
      name: input.name,
      description: input.description,
      permissions: input.permissions ?? [],
    });
    return { ok: true, role: data.data };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể tạo vai trò";
    return { ok: false, error: msg };
  }
}

// BE: PUT /api/roles/{roleName}
export async function updateRole(
  roleName: string,
  input: CreateRoleInput,
): Promise<{ ok: boolean; role?: RoleDto; error?: string }> {
  try {
    const { data } = await realApiClient.put<BeApiResponse<RoleDto>>(
      `/roles/${encodeURIComponent(roleName)}`,
      {
        name: input.name,
        description: input.description,
        permissions: input.permissions ?? [],
      },
    );
    return { ok: true, role: data.data };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      "Không thể cập nhật vai trò";
    return { ok: false, error: msg };
  }
}

// BE: GET /api/roles/{roleName}/permissions — controller dùng @RequestParam roleName nên phải truyền cả query
export async function getRolePermissions(
  roleName: string,
): Promise<Permission[]> {
  try {
    const { data } = await realApiClient.get<BeApiResponse<Permission[]>>(
      `/roles/${encodeURIComponent(roleName)}/permissions`,
      { params: { roleName } },
    );
    return data.data ?? [];
  } catch {
    return [];
  }
}

// BE: GET /api/roles/{roleName}/edit-permissions — trả danh sách quyền group theo module + đánh dấu checked
export async function getEditablePermissions(
  roleName: string,
): Promise<PermissionGroup[]> {
  try {
    const { data } = await realApiClient.get<BeApiResponse<PermissionGroup[]>>(
      `/roles/${encodeURIComponent(roleName)}/edit-permissions`,
    );
    return data.data ?? [];
  } catch {
    return [];
  }
}
