import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes and the roles allowed to access them. Thứ tự: cụ thể hơn đứng trước. */
const ROUTE_ROLES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: "/dashboard/parent",          allowed: ["parent"] },
  { prefix: "/dashboard/tutor-candidate", allowed: ["tutorCandidate"] },
  { prefix: "/dashboard/tutor",           allowed: ["tutor"] },
  { prefix: "/dashboard/admin",           allowed: ["admin"] },
  { prefix: "/parent",                    allowed: ["parent"] },
  // Gia sư CHƯA duyệt (tutorCandidate) KHÔNG được vào workspace /tutor/* — chỉ tutor
  // đã duyệt. Trang trạng thái đơn (/tutor-application) & đăng ký (/apply-tutor) nằm
  // ngoài matcher nên candidate vẫn xem được.
  { prefix: "/tutor",                     allowed: ["tutor"] },
  { prefix: "/admin",                     allowed: ["admin"] },
];

const ROLE_DASHBOARD: Record<string, string> = {
  parent:         "/dashboard/parent",
  tutorCandidate: "/dashboard/tutor-candidate",
  tutor:          "/dashboard/tutor",
  admin:          "/dashboard/admin",
};

// So khớp theo SEGMENT: "/tutor" khớp "/tutor" và "/tutor/…" nhưng KHÔNG khớp
// "/tutors" (list công khai) hay "/tutor-application"; "/dashboard/tutor" cũng
// không còn nuốt nhầm "/dashboard/tutor-candidate".
function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("auth_role")?.value ?? null;

  const matched = ROUTE_ROLES.find((r) => matchesPrefix(pathname, r.prefix));
  if (!matched) return NextResponse.next();

  // Not logged in → redirect to login with return URL
  if (!role) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (!matched.allowed.includes(role)) {
    const dest = ROLE_DASHBOARD[role] ?? "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/parent/:path*", "/tutor/:path*", "/admin/:path*"],
};
