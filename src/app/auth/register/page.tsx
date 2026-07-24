"use client";
import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { register } from "@/api/authApi";
import { useAuthStore } from "@/store/useAuthStore";
import { PublicRoute } from "@/components/layout/RouteGuards";
import { getDefaultRoute } from "@/lib/permissions";

const REGISTER_HERO_IMAGE =
  "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80&auto=format&fit=crop";

const REGISTER_BENEFITS = [
  {
    title: "Cộng đồng gia sư xác thực",
    text: "Tìm gia sư theo môn, khu vực và lịch trống thực tế.",
  },
  {
    title: "Ví bảo đảm thanh toán",
    text: "Tiền chỉ chuyển khi buổi học hoàn thành — an tâm tuyệt đối.",
  },
  {
    title: "Theo dõi tiến độ rõ ràng",
    text: "Dashboard cập nhật buổi học, ghi chú và đánh giá sau từng buổi.",
  },
];

type Role = "PARENT" | "TUTOR";

const ROLE_OPTIONS: Array<{
  role: Role;
  icon: typeof Users;
  label: string;
  description: string;
  features: string[];
  gradient: string;
  accentColor: string;
  badge?: string;
}> = [
  {
    role: "PARENT",
    icon: Users,
    label: "Phụ huynh",
    description: "Tìm kiếm và đặt lịch với gia sư phù hợp cho con em",
    features: [
      "Tìm gia sư theo môn học & khu vực",
      "Xem lịch trống và đặt buổi học",
      "Thanh toán an toàn qua ví LIFLOW",
      "Đánh giá và nhận xét gia sư",
    ],
    gradient: "from-blue-500 to-cyan-500",
    accentColor: "blue",
  },
  {
    role: "TUTOR",
    icon: GraduationCap,
    label: "Gia sư",
    description: "Tạo hồ sơ và nhận học sinh từ hàng nghìn phụ huynh",
    features: [
      "Tạo hồ sơ & tải bằng cấp xác thực",
      "Thiết lập lịch dạy & mức học phí",
      "Nhận yêu cầu từ phụ huynh",
      "Quản lý thu nhập minh bạch",
    ],
    gradient: "from-purple-500 to-pink-500",
    accentColor: "purple",
    badge: "Cần admin duyệt hồ sơ",
  },
];

function RegisterForm() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();

  // Step 1: choose role, Step 2: fill info
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleNextStep = () => {
    if (!selectedRole) {
      setError("Vui lòng chọn vai trò của bạn.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setError("Vui lòng nhập số điện thoại hợp lệ.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!selectedRole) {
      setStep(1);
      return;
    }

    setLoading(true);
    const result = await register({
      fullName: fullName.trim(),
      email,
      password,
      phone: phone.trim(),
      role: selectedRole, // gửi "PARENT" hoặc "TUTOR" lên BE
    });
    setLoading(false);

    if (result.ok && result.user) {
      storeLogin(result.user);
      // BẮT BUỘC set cookie auth_role NGAY để proxy (middleware) đọc đúng role.
      // Thiếu bước này: cookie rỗng → proxy đá tân gia sư về /auth/login; hoặc nếu
      // còn cookie admin cũ (đã từng login admin) → proxy tưởng admin, đá về
      // /dashboard/admin. getDefaultRoute đưa gia sư CHƯA duyệt (tutorCandidate) về
      // /dashboard/tutor-candidate (trang trạng thái đơn), parent → /dashboard/parent.
      document.cookie = `auth_role=${result.user.role}; path=/; SameSite=Strict; max-age=86400`;
      router.replace(getDefaultRoute(result.user.role));
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
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
              <Image src="/logo.png" alt="LIFLOW" fill sizes="36px" className="object-contain" />
            </span>
            <span className="text-base font-bold tracking-tight">
              LI<span className="text-primary">FLOW</span>
            </span>
          </Link>

          <div className="mx-auto w-full max-w-md">
            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === 1
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === 1 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Chọn vai trò
                </span>
              </div>
              <div className="h-px flex-1 bg-border" />
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step === 2
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  2
                </div>
                <span
                  className={`text-sm font-medium ${
                    step === 2 ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  Thông tin tài khoản
                </span>
              </div>
            </div>

            {/* ── STEP 1: Chọn vai trò ── */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 space-y-1.5">
                  <h1
                    className="text-3xl font-bold tracking-tight text-foreground"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Bạn là ai?
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Chọn vai trò phù hợp để bắt đầu hành trình của bạn
                  </p>
                </div>

                <div className="space-y-4">
                  {ROLE_OPTIONS.map(({ role, icon: Icon, label, description, features, gradient, badge }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`relative w-full rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                        selectedRole === role
                          ? "border-primary bg-primary/5 shadow-lg shadow-primary/15"
                          : "border-border bg-card hover:border-primary/40 hover:shadow-md hover:bg-muted/30"
                      }`}
                    >
                      {selectedRole === role && (
                        <div className="absolute top-4 right-4">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary-foreground" />
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        <div
                          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-md`}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-bold text-foreground">{label}</h3>
                            {badge && (
                              <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                {badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">{description}</p>
                          <ul className="space-y-1">
                            {features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedRole}
                  className="mt-5 h-11 w-full text-base font-semibold"
                >
                  Tiếp tục
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="mt-5 text-center text-sm text-muted-foreground">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            )}

            {/* ── STEP 2: Điền thông tin ── */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-6 space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setError(""); }}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Quay lại
                    </button>
                    {selectedRole && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${
                          selectedRole === "PARENT"
                            ? "bg-gradient-to-r from-blue-500 to-cyan-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                        }`}
                      >
                        {selectedRole === "PARENT" ? (
                          <Users className="h-3 w-3" />
                        ) : (
                          <GraduationCap className="h-3 w-3" />
                        )}
                        {selectedRole === "PARENT" ? "Phụ huynh" : "Gia sư"}
                      </span>
                    )}
                  </div>
                  <h1
                    className="text-3xl font-bold tracking-tight text-foreground"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    Tạo tài khoản
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Điền thông tin để hoàn tất đăng ký
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Họ và tên <span className="text-destructive">*</span>
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
                      Email <span className="text-destructive">*</span>
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
                      Số điện thoại <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="tel"
                        placeholder="0901234567"
                        className="pl-9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Mật khẩu <span className="text-destructive">*</span>
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

                  {selectedRole === "TUTOR" && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                      <p className="text-xs leading-relaxed text-amber-800">
                        <strong>Lưu ý gia sư:</strong> Sau khi đăng ký, bạn cần hoàn thành hồ sơ và tải bằng cấp. Admin sẽ xét duyệt trước khi tài khoản hoạt động.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold"
                    loading={loading}
                  >
                    {selectedRole === "TUTOR" ? "Đăng ký & Điền hồ sơ gia sư" : "Đăng ký tài khoản"}
                  </Button>
                </form>

                <div className="mt-5 text-center text-sm text-muted-foreground">
                  Đã có tài khoản?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary hover:underline"
                  >
                    Đăng nhập
                  </Link>
                </div>
              </div>
            )}

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
                  Tham gia mạng lưới gia sư uy tín hàng đầu Việt Nam
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-white/75 xl:text-base">
                  Tạo tài khoản trong 30 giây. Dù bạn là phụ huynh hay gia sư,
                  LIFLOW đem đến công cụ phù hợp.
                </p>
              </div>

              <ul className="space-y-4">
                {REGISTER_BENEFITS.map(({ title, text }) => (
                  <li key={title} className="space-y-0.5">
                    <div className="text-sm font-semibold text-white">
                      {title}
                    </div>
                    <div className="text-xs leading-relaxed text-white/70 xl:text-sm">
                      {text}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/70">
              Tạo tài khoản miễn phí — không mất phí đăng ký với cả phụ huynh và gia sư.
            </p>
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
