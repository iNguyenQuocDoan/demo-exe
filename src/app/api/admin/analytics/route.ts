import { NextRequest, NextResponse } from "next/server";

// Đọc số lượt truy cập từ Vercel Web Analytics API và trả về cho dashboard
// admin. Token Vercel là BÍ MẬT nên chỉ được dùng ở server (route này) — không
// bao giờ để lộ xuống client. Chỉ admin (verify qua BE /auth/me) mới đọc được.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BE_ORIGIN =
  process.env.NEXT_PUBLIC_BE_ORIGIN ?? "https://liflow-be.onrender.com";
const VERCEL_API = "https://api.vercel.com/v1/query/web-analytics";
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? "team_mDK8j89iFmrPApMJeNhElbHI";
const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ?? "prj_7rb6vidOjgKlWinFIAOz131lozaM";

type Gate = { ok: true } | { ok: false; status: number; error: string };

// fetch có timeout — tránh treo hàm serverless khi BE (Render) cold-start chậm.
async function fetchWithTimeout(
  url: string | URL,
  init: RequestInit,
  ms: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Xác thực caller là admin bằng cách forward JWT tới BE /auth/me.
async function requireAdmin(req: NextRequest): Promise<Gate> {
  const auth = req.headers.get("authorization");
  if (!auth) return { ok: false, status: 401, error: "Chưa đăng nhập." };
  try {
    const res = await fetchWithTimeout(
      `${BE_ORIGIN}/api/auth/me`,
      { headers: { authorization: auth, connection: "close" }, cache: "no-store" },
      10_000,
    );
    if (!res.ok) {
      return { ok: false, status: 401, error: "Phiên đăng nhập không hợp lệ." };
    }
    const me = (await res.json()) as { role?: string; data?: { role?: string } };
    const role = String(me?.role ?? me?.data?.role ?? "").toUpperCase();
    if (role !== "ADMIN") {
      return { ok: false, status: 403, error: "Chỉ admin mới xem được số liệu này." };
    }
    return { ok: true };
  } catch (err) {
    const timedOut = (err as Error)?.name === "AbortError";
    return {
      ok: false,
      status: 504,
      error: timedOut
        ? "Máy chủ xác thực phản hồi chậm, thử lại sau."
        : "Không xác thực được người dùng.",
    };
  }
}

type VercelResult =
  | { ok: true; data: unknown }
  | { ok: false; status: number; error: string };

async function vercelQuery(
  token: string,
  path: "visits/count" | "visits/aggregate",
  params: Record<string, string>,
): Promise<VercelResult> {
  const url = new URL(`${VERCEL_API}/${path}`);
  url.searchParams.set("teamId", TEAM_ID);
  url.searchParams.set("projectId", PROJECT_ID);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  let res: Response;
  try {
    res = await fetchWithTimeout(
      url,
      {
        headers: { authorization: `Bearer ${token}` },
        // Cache 5 phút để không gọi Vercel API quá dày khi refresh liên tục.
        next: { revalidate: 300 },
      },
      10_000,
    );
  } catch (err) {
    const timedOut = (err as Error)?.name === "AbortError";
    return {
      ok: false,
      status: 504,
      error: timedOut ? "Vercel API phản hồi chậm." : "Không gọi được Vercel API.",
    };
  }

  if (!res.ok) {
    let message = `Vercel API ${res.status}`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      if (body?.error?.message) message = body.error.message;
    } catch {
      /* body không phải JSON — giữ message mặc định */
    }
    return { ok: false, status: res.status, error: message };
  }
  return { ok: true, data: await res.json() };
}

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  const gate = await requireAdmin(req);
  if (!gate.ok) {
    return NextResponse.json({ ok: false, error: gate.error }, { status: gate.status });
  }

  const token = process.env.VERCEL_ANALYTICS_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Chưa cấu hình VERCEL_ANALYTICS_TOKEN. Tạo access token trong Vercel " +
          "(Account Settings → Tokens) và thêm vào biến môi trường của project.",
      },
      { status: 503 },
    );
  }

  const until = new Date();
  const since = new Date(until.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [countRes, aggRes] = await Promise.all([
    vercelQuery(token, "visits/count", {}),
    vercelQuery(token, "visits/aggregate", {
      since: ymd(since),
      until: ymd(until),
      by: "day",
    }),
  ]);

  if (!countRes.ok) {
    return NextResponse.json(
      { ok: false, error: `Không lấy được số liệu từ Vercel: ${countRes.error}` },
      { status: 502 },
    );
  }

  const countData = (countRes.data as { data?: { pageviews?: number; visitors?: number } })?.data;
  const totals = {
    pageviews: Number(countData?.pageviews ?? 0),
    visitors: Number(countData?.visitors ?? 0),
  };

  // Aggregate có thể lỗi (giới hạn reporting window theo plan) — vẫn trả totals.
  let daily: Array<{ date: string; pageviews: number; visitors: number }> = [];
  if (aggRes.ok) {
    const rows = (aggRes.data as {
      data?: Array<{ timestamp?: string; pageviews?: number; visitors?: number }>;
    })?.data;
    if (Array.isArray(rows)) {
      daily = rows.map((r) => ({
        date: String(r.timestamp ?? "").slice(0, 10),
        pageviews: Number(r.pageviews ?? 0),
        visitors: Number(r.visitors ?? 0),
      }));
    }
  }

  return NextResponse.json({
    ok: true,
    totals,
    daily,
    updatedAt: new Date().toISOString(),
  });
}
