// Một vài endpoint mà khách CHƯA đăng nhập vẫn cần lại bị BE bắt buộc Bearer token
// (điển hình: đánh giá gia sư /api/feedback/**). Để các phần đó hiển thị dữ liệu
// THẬT, ta lấy ngầm một "guest token" bằng tài khoản demo read-only. KHÔNG set
// session (không lưu auth_user / cookie) nên app vẫn ở trạng thái chưa đăng nhập.
//
// LƯU Ý: DANH SÁCH và CHI TIẾT gia sư KHÔNG dùng token này nữa — chúng gọi thẳng
// endpoint PUBLIC (/api/tutors/search, /api/tutors/*/details, /api/tutors/slots/**)
// nên xem được kể cả khi guest-login hỏng (vd tài khoản demo bị đổi mật khẩu).

const GUEST_EMAIL = process.env.NEXT_PUBLIC_GUEST_EMAIL ?? "parent1@tutor.com";
const GUEST_PASSWORD = process.env.NEXT_PUBLIC_GUEST_PASSWORD ?? "12345";

let cached: Promise<string | null> | null = null;

async function login(): Promise<string | null> {
  try {
    const res = await fetch("/api/be/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: GUEST_EMAIL, password: GUEST_PASSWORD }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    return data?.accessToken ?? null;
  } catch {
    return null;
  }
}

/** Token read-only để xem catalog khi chưa đăng nhập. Cache theo phiên tab. */
export function getGuestToken(): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!cached) {
    cached = login().then((t) => {
      if (!t) cached = null; // cho phép thử lại lần sau nếu thất bại
      return t;
    });
  }
  return cached;
}
