"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicRoute } from "@/components/layout/RouteGuards";
import { getDefaultRoute } from "@/lib/permissions";

const LOGIN_HERO_IMAGE =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80&auto=format&fit=crop";

const LOGIN_HIGHLIGHTS = [
  { text: "Ví bảo đảm — tiền chỉ chuyển khi buổi học hoàn thành" },
  { text: "Gia sư xác thực, đánh giá minh bạch" },
  { text: "Đặt lịch nhanh, hủy hoàn tiền tự động" },
];

function LoginForm() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.ok && result.user) {
      storeLogin(result.user);
      document.cookie = `auth_role=${result.user.role}; path=/; SameSite=Strict; max-age=86400`;
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      // getDefaultRoute xử lý đủ 5 role (gồm tutorCandidate → /dashboard/tutor-candidate);
      // trước đây chuỗi ternary thiếu tutorCandidate nên gia sư chưa duyệt bị đá về guest.
      const dest = next ?? getDefaultRoute(result.user.role);
      router.push(dest);
    } else {
      setError(result.error ?? "Đăng nhập thất bại.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-350 grid-cols-1 lg:grid-cols-2">
        {/* ── LEFT — Hero image with brand overlay ────────────────────────── */}
        <aside className="relative hidden overflow-hidden lg:block">
          <Image
            src={LOGIN_HERO_IMAGE}
            alt="Sinh viên đang học tập cùng nhau"
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
            priority
          />
          {/* Brand gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.16 250 / 0.86) 0%, oklch(0.42 0.14 250 / 0.78) 45%, oklch(0.55 0.18 70 / 0.42) 100%)",
            }}
          />
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "42px 42px",
            }}
          />
          {/* Soft glow blobs */}
          <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/30">
                <Image src="/logo.png" alt="LIFLOW" fill sizes="40px" className="object-contain" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                LI<span className="text-amber-300">FLOW</span>
              </span>
            </Link>

            <div className="space-y-7">
              <div className="space-y-3">
                <h2
                  className="text-3xl font-bold leading-tight text-white xl:text-4xl"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Tiếp tục hành trình học tập cùng gia sư uy tín
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
                  Quản lý buổi học, theo dõi tiến độ và kết nối với gia sư xác
                  thực trong một dashboard duy nhất.
                </p>
              </div>

              <ul className="space-y-2.5">
                {LOGIN_HIGHLIGHTS.map(({ text }) => (
                  <li
                    key={text}
                    className="text-sm leading-relaxed text-white/85"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/70">
              <span>Bảo mật thông tin</span>
              <span className="h-3 w-px bg-white/15" />
              <span>Gia sư xác thực</span>
              <span className="h-3 w-px bg-white/15" />
              <span>Hoàn tiền khi huỷ</span>
            </div>
          </div>
        </aside>

        {/* ── RIGHT — Form ──────────────────────────────────────────────── */}
        <section className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
          {/* Mobile-only brand bar */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 self-start lg:hidden"
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <Image src="/logo.png" alt="LIFLOW" fill sizes="36px" className="object-contain" />
            </span>
            <span className="text-base font-bold tracking-tight">
              LI<span className="text-primary">FLOW</span>
            </span>
          </Link>

          <div className="mx-auto w-full max-w-md">
            <div className="mb-7 space-y-1.5">
              <h1
                className="text-3xl font-bold tracking-tight text-foreground"
                style={{ letterSpacing: "-0.02em" }}
              >
                Đăng nhập
              </h1>
              <p className="text-sm text-muted-foreground">
                Chào mừng bạn trở lại LIFLOW
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">
                    Mật khẩu
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full text-base font-semibold"
                loading={loading}
              >
                Đăng nhập
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-primary hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Quay về trang chủ
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
}
