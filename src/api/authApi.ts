import { realApiClient } from "@/lib/realApiClient";
import { setAuthToken } from "@/lib/apiClient";
import type { User, UserRole } from "@/types";

// ── BE response shapes ────────────────────────────────────────────────────────
interface BeLoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface BeUserResponse {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender?: string;
  address?: string;
  dob?: string;
  provider?: string;
  active: boolean;
  role: string; // "PARENT" | "TUTOR" | "ADMIN"
}

// ── Adapters ──────────────────────────────────────────────────────────────────
function mapBeRoleToFe(beRole: string | undefined): UserRole {
  switch ((beRole ?? "").toUpperCase()) {
    case "PARENT":
      return "parent";
    case "TUTOR":
      return "tutor";
    case "ADMIN":
      return "admin";
    default:
      return "guest";
  }
}

function mapFeRoleToBe(role: string | undefined): string {
  switch ((role ?? "").toLowerCase()) {
    case "tutor":
      return "TUTOR";
    case "admin":
      return "ADMIN";
    default:
      return "PARENT";
  }
}

// BE chỉ có role TUTOR — gồm CẢ gia sư chưa được admin duyệt. Ta phân biệt bằng
// verificationStatus của hồ sơ (/tutors/my-profile): chỉ APPROVED mới là "tutor"
// thật (được vào dashboard gia sư). Các trạng thái còn lại (NOT_VERIFIED / PENDING
// / REJECTED) → "tutorCandidate": chỉ xem được trạng thái đơn, KHÔNG vào dashboard.
async function fetchTutorVerificationStatus(): Promise<string | undefined> {
  try {
    // BE /tutors/my-profile trả RAW TutorDetailResponse (KHÔNG bọc {data} như /details).
    // Đọc thẳng verificationStatus; vẫn fallback data.data phòng BE đổi sang bọc ApiResponse.
    const { data } = await realApiClient.get<{
      verificationStatus?: string;
      data?: { verificationStatus?: string };
    }>("/tutors/my-profile");
    return data?.verificationStatus ?? data?.data?.verificationStatus;
  } catch {
    return undefined;
  }
}

async function resolveUser(be: BeUserResponse): Promise<User> {
  let role = mapBeRoleToFe(be.role);
  if (role === "tutor") {
    const status = await fetchTutorVerificationStatus();
    // Chưa chắc chắn APPROVED (kể cả khi gọi lỗi) → giữ ở tutorCandidate cho an toàn:
    // không mở dashboard gia sư khi chưa xác nhận được đã duyệt.
    if (status !== "APPROVED") role = "tutorCandidate";
  }
  return {
    id: be.id,
    fullName: be.fullName,
    email: be.email,
    role,
    phone: be.phoneNumber,
    address: be.address,
    // BE không trả tutorProfileId riêng — gia sư được đánh khóa theo chính UUID
    // của user (/tutors/{uuid}/...). Chỉ gán khi đã là tutor thật (đã duyệt).
    tutorProfileId: role === "tutor" ? be.id : undefined,
  };
}

function extractError(err: unknown, fallback: string): string {
  const r = (err as { response?: { data?: { message?: string; error?: string; detail?: string } } })?.response?.data;
  return r?.message ?? r?.error ?? r?.detail ?? fallback;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function login(
  email: string,
  password: string,
): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const { data } = await realApiClient.post<BeLoginResponse>("/auth/login", {
      email,
      password,
    });
    setAuthToken(data.accessToken);
    const { data: meRes } = await realApiClient.get<BeUserResponse>("/auth/me");
    const user = await resolveUser(meRes);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    return { ok: true, user };
  } catch (err) {
    setAuthToken(null);
    return { ok: false, error: extractError(err, "Đăng nhập thất bại") };
  }
}

export async function register(data: {
  fullName: string;
  email: string;
  password: string;
  /** "PARENT" | "TUTOR" — gửi thẳng lên BE, không cần mapping */
  role?: string;
  phone?: string;
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    // Số điện thoại từ form; fallback để tránh lỗi @NotBlank của BE
    const phoneNumber = data.phone?.trim() || "0000000000";
    // role đã ở dạng "PARENT" / "TUTOR" từ FE, mapFeRoleToBe vẫn giữ để an toàn
    const beRole = ["PARENT", "TUTOR", "ADMIN"].includes((data.role ?? "").toUpperCase())
      ? data.role!.toUpperCase()
      : mapFeRoleToBe(data.role);
    await realApiClient.post("/auth/register", {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      phoneNumber,
      role: beRole,
    });
    return await login(data.email, data.password);
  } catch (err) {
    return { ok: false, error: extractError(err, "Đăng ký thất bại") };
  }
}

export async function updateUserRole(
  _userId: string,
  _newRole: string,
): Promise<{ ok: boolean; error?: string }> {
  return {
    ok: false,
    error: "Backend hiện chưa hỗ trợ đổi vai trò sau khi đăng ký",
  };
}

interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// BE: POST /api/auth/register-oauth2 — hoàn tất đăng ký sau khi đã đăng nhập Google
export async function registerOAuth2(input: {
  email: string;
  fullName: string;
  phoneNumber: string;
  password?: string;
  roleName?: string; // PARENT | TUTOR | ADMIN
  address?: string;
  dob?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
}): Promise<{ ok: boolean; user?: User; error?: string }> {
  try {
    const { data } = await realApiClient.post<BeApiResponse<BeLoginResponse>>(
      "/auth/register-oauth2",
      {
        email: input.email,
        fullName: input.fullName,
        phoneNumber: input.phoneNumber,
        password: input.password ?? "",
        roleName: mapFeRoleToBe(input.roleName),
        address: input.address,
        dob: input.dob,
        gender: input.gender,
      },
    );
    setAuthToken(data.data.accessToken);
    const { data: me } = await realApiClient.get<BeUserResponse>("/auth/me");
    const user = await resolveUser(me);
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(user));
    }
    return { ok: true, user };
  } catch (err) {
    return { ok: false, error: extractError(err, "Đăng ký OAuth2 thất bại") };
  }
}

export async function changePassword(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post("/auth/change-password", input);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: extractError(err, "Đổi mật khẩu thất bại") };
  }
}

// BE: POST /api/auth/forgot-password?email= — gửi mã OTP đặt lại mật khẩu về email
export async function forgotPassword(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post("/auth/forgot-password", null, {
      params: { email },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: extractError(err, "Không gửi được mã OTP") };
  }
}

// BE: POST /api/auth/verify-otp?email=&otp=
export async function verifyOtp(
  email: string,
  otp: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post("/auth/verify-otp", null, {
      params: { email, otp },
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: extractError(err, "Mã OTP không hợp lệ") };
  }
}

// BE: POST /api/auth/reset-password — body { email, otp, newPassword, confirmPassword }
export async function resetPassword(input: {
  email: string;
  otp: number;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await realApiClient.post("/auth/reset-password", input);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: extractError(err, "Đặt lại mật khẩu thất bại") };
  }
}

// BE: POST /api/auth/refresh-token — body { refreshToken }
export async function refreshToken(
  rt: string,
): Promise<{ ok: boolean; accessToken?: string; refreshToken?: string; error?: string }> {
  try {
    const { data } = await realApiClient.post<BeApiResponse<BeLoginResponse>>(
      "/auth/refresh-token",
      { refreshToken: rt },
    );
    setAuthToken(data.data.accessToken);
    return {
      ok: true,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
  } catch (err) {
    return { ok: false, error: extractError(err, "Refresh token thất bại") };
  }
}

export async function logout(): Promise<void> {
  try {
    await realApiClient.post("/auth/logout");
  } catch {
    // swallow — local clear is what matters
  }
  setAuthToken(null);
}

export async function getMe(): Promise<User | null> {
  try {
    const { data } = await realApiClient.get<BeUserResponse>("/auth/me");
    return await resolveUser(data);
  } catch {
    return null;
  }
}

export function listenAuthState(cb: (user: User | null) => void): () => void {
  if (typeof window === "undefined") {
    cb(null);
    return () => {};
  }

  const stored = localStorage.getItem("auth_user");
  const token = localStorage.getItem("auth_token");

  if (stored && token) {
    try {
      const user = JSON.parse(stored) as User;
      cb(user);
      getMe()
        .then((fresh) => {
          if (fresh) {
            localStorage.setItem("auth_user", JSON.stringify(fresh));
            cb(fresh);
          } else {
            setAuthToken(null);
            cb(null);
          }
        })
        .catch(() => {
          setAuthToken(null);
          cb(null);
        });
    } catch {
      cb(null);
    }
  } else {
    cb(null);
  }
  return () => {};
}
