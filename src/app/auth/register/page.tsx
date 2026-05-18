"use client";
import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicRoute } from "@/components/layout/RouteGuards";

const REGISTER_HERO_IMAGE =
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80&auto=format&fit=crop";

const REGISTER_BENEFITS = [
  {
    icon: Users,
    title: "Cộng đồng 1.200+ gia sư",
    text: "Tìm gia sư theo môn, khu vực và lịch trống thực tế.",
  },
  {
    icon: Wallet,
    title: "Ví bảo đảm thanh toán",
    text: "Tiền chỉ chuyển khi buổi học hoàn thành — an tâm tuyệt đối.",
  },
  {
    icon: BookOpen,
    title: "Theo dõi tiến độ rõ ràng",
    text: "Dashboard cập nhật buổi học, ghi chú và đánh giá sau từng buổi.",
  },
];

function RegisterForm() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    setLoading(true);
    const result = await register({
      fullName: fullName.trim(),
      email,
      password,
      role: "guest",
    });
    setLoading(false);
    if (result.ok && result.user) {
      storeLogin(result.user);
      router.push("/auth/select-role");
    } else {
      setError(result.error ?? "Đăng ký thất bại.");
    }
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-350 grid-cols-1 lg:grid-cols-2">
        {/* ── LEFT — Form ──────────────────────────────────────────────── */}
        <section className="order-2 flex flex-col justify-center px-6 py-12 sm:px-10 lg:order-1 lg:px-12 xl:px-16">
          {/* Mobile-only brand bar */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 self-start lg:hidden"
          >
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-md shadow-primary/30">
              <GraduationCap className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
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
                Tạo tài khoản
              </h1>
              <p className="text-sm text-muted-foreground">
                Tham gia cộng đồng LIFLOW — miễn phí đăng ký
              </p>
            </div>

            <div className="mb-6 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Sau khi đăng ký, bạn sẽ chọn vai trò{" "}
                <strong className="text-foreground">Phụ huynh</strong> hoặc{" "}
                <strong className="text-foreground">Gia sư</strong> để bắt đầu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nguyễn Văn A"
                    className="pl-9"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

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
                <label className="text-sm font-medium text-foreground">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    className="pl-9 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
                Đăng ký tài khoản
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-primary hover:underline"
              >
                Đăng nhập
              </Link>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              <Link href="/" className="transition-colors hover:text-primary">
                ← Quay về trang chủ
              </Link>
            </p>
          </div>
        </section>

        {/* ── RIGHT — Hero image with benefits ─────────────────────────── */}
        <aside className="relative order-1 hidden overflow-hidden lg:order-2 lg:block">
          <Image
            src={REGISTER_HERO_IMAGE}
            alt="Học sinh đang ghi chép bài học"
            fill
            sizes="(max-width: 1024px) 0px, 50vw"
            className="object-cover"
            priority
          />
          {/* Brand gradient overlay — amber-leaning to differentiate from login */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(225deg, oklch(0.55 0.18 70 / 0.5) 0%, oklch(0.4 0.16 250 / 0.82) 45%, oklch(0.32 0.14 250 / 0.88) 100%)",
            }}
          />
          {/* Subtle dot pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* Soft glow blobs */}
          <div className="absolute -top-32 -right-20 h-96 w-96 rounded-full bg-amber-400/22 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-primary/30 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-end text-white"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/20">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                LI<span className="text-amber-300">FLOW</span>
              </span>
            </Link>

            <div className="space-y-7">
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Đăng ký miễn phí
                </span>
                <h2
                  className="text-3xl font-bold leading-tight text-white xl:text-4xl"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Tham gia mạng lưới gia sư uy tín hàng đầu Việt Nam
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
                  Tạo tài khoản trong 30 giây. Dù bạn là phụ huynh hay gia sư,
                  LIFLOW đem đến công cụ phù hợp.
                </p>
              </div>

              <ul className="space-y-4">
                {REGISTER_BENEFITS.map(({ icon: Icon, title, text }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/12 backdrop-blur-md">
                      <Icon className="h-4.5 w-4.5 text-amber-300" />
                    </span>
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">
                        {title}
                      </div>
                      <div className="text-xs leading-relaxed text-white/70 xl:text-sm">
                        {text}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <div className="flex -space-x-2">
                {["AN", "MA", "HL"].map((seed, i) => (
                  <div
                    key={seed}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/40 text-[10px] font-bold text-white shadow-sm"
                    style={{
                      background: `oklch(${0.5 + i * 0.05} 0.16 ${245 + i * 22})`,
                    }}
                  >
                    {seed}
                  </div>
                ))}
              </div>
              <span>
                <strong className="text-white">+120 gia sư mới</strong> đã đăng
                ký tháng này
              </span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <PublicRoute>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="animate-pulse text-sm text-muted-foreground">
              Đang tải...
            </div>
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </PublicRoute>
  );
}
