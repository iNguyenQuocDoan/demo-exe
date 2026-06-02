import { NextRequest } from "next/server";

// Proxy /api/be/* → ${NEXT_PUBLIC_BE_ORIGIN}/api/* (BE Spring Boot, no CORS).
// Thay cho next.config rewrites() vì rewrite của Next dev hay bị ECONNRESET khi
// tái dùng keep-alive connection tới Render (Cloudflare đóng idle conn). Route
// handler này retry khi gặp lỗi kết nối → ổn định cả local lẫn Vercel.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BE_ORIGIN = process.env.NEXT_PUBLIC_BE_ORIGIN ?? "http://localhost:8080";

// Header không được forward (hop-by-hop / sẽ tự tính lại)
const STRIP_REQ = new Set(["host", "connection", "content-length", "accept-encoding"]);
const STRIP_RES = new Set(["content-encoding", "content-length", "transfer-encoding", "connection"]);

function isConnError(err: unknown): boolean {
  const code = (err as { cause?: { code?: string }; code?: string })?.cause?.code
    ?? (err as { code?: string })?.code;
  return code === "ECONNRESET" || code === "ECONNREFUSED" || code === "UND_ERR_SOCKET";
}

async function proxy(req: NextRequest, slug: string[]): Promise<Response> {
  const target = `${BE_ORIGIN}/api/${slug.map(encodeURIComponent).join("/")}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (!STRIP_REQ.has(k.toLowerCase())) headers.set(k, v);
  });
  headers.set("connection", "close"); // tránh reuse connection đã chết

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.arrayBuffer() : undefined;

  const init: RequestInit = {
    method: req.method,
    headers,
    body: body && body.byteLength ? body : undefined,
    redirect: "manual",
    cache: "no-store",
  };

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(target, init);
      const out = new Headers();
      res.headers.forEach((v, k) => {
        if (!STRIP_RES.has(k.toLowerCase())) out.set(k, v);
      });
      return new Response(res.body, { status: res.status, statusText: res.statusText, headers: out });
    } catch (err) {
      lastErr = err;
      if (!isConnError(err)) break;
      // retry 1 lần với connection mới
    }
  }
  return Response.json(
    { code: 502, message: "Bad Gateway (proxy)", error: String(lastErr) },
    { status: 502 },
  );
}

type Ctx = { params: Promise<{ slug: string[] }> };
const handler = async (req: NextRequest, ctx: Ctx) =>
  proxy(req, (await ctx.params).slug ?? []);

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
  handler as HEAD,
  handler as OPTIONS,
};
