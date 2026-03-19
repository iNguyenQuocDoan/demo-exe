import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes and the roles allowed to access them */
const ROUTE_ROLES: Array<{ prefix: string; allowed: string[] }> = [
  { prefix: "/dashboard/parent", allowed: ["parent"] },
  { prefix: "/dashboard/tutor",  allowed: ["tutor"]  },
  { prefix: "/dashboard/admin",  allowed: ["admin"]  },
  { prefix: "/parent/",          allowed: ["parent"] },
  { prefix: "/tutor/",           allowed: ["tutor"]  },
  { prefix: "/admin/",           allowed: ["admin"]  },
];

const ROLE_DASHBOARD: Record<string, string> = {
  parent: "/dashboard/parent",
  tutor:  "/dashboard/tutor",
  admin:  "/dashboard/admin",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("auth_role")?.value ?? null;

  const matched = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
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
