"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPassword, resetPassword } from "@/api/authApi";
import { PublicRoute } from "@/components/layout/RouteGuards";

type Step = "email" | "reset" | "done";

function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    if (!email) {
      setError("Vui lòng nhập email tài khoản của bạn.");
      return;
    }
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.ok) {
      setStep("reset");
      setNotice(`Đã gửi mã OTP đến ${email}. Kiểm tra hộp thư của bạn.`);
    } else {
      setError(result.error ?? "Không gửi được mã OTP.");
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.ok) setNotice(`Đã gửi lại mã OTP đến ${email}.`);
    else setError(result.error ?? "Không gửi lại được mã OTP.");
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const otpNum = Number(otp);
    if (!otp || Number.isNaN(otpNum)) {
      setError("Mã OTP không hợp lệ.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    const result = await resetPassword({
      email,
      otp: otpNum,
      newPassword,
      confirmPassword,
    });
    setLoading(false);
    if (result.ok) {
      setStep("done");
    } else {
      setError(result.error ?? "Đặt lại mật khẩu thất bại.");
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center gap-2">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl">
            <Image src="/logo.png" alt="LIFLOW" fill sizes="36px" className="object-contain" />
          </span>
          <span className="text-base font-bold tracking-tight">
            LI<span className="text-primary">FLOW</span>
          </span>
        </Link>

        <div className="surface-card p-6 sm:p-8">
          {step === "done" ? (
            <div className="space-y-5 text-center">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Đặt lại mật khẩu thành công
                </h1>
                <p className="text-sm text-muted-foreground">
                  Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
                </p>
              </div>
              <Button
                className="h-11 w-full text-base font-semibold"
                onClick={() => router.push("/auth/login")}
              >
                Đến trang đăng nhập
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 space-y-1.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Quên mật khẩu
                </h1>
                <p className="text-sm text-muted-foreground">
                  {step === "email"
                    ? "Nhập email tài khoản, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu."
                    : "Nhập mã OTP đã gửi tới email và mật khẩu mới của bạn."}
                </p>
              </div>

              {notice && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {notice}
                </div>
              )}
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              {step === "email" ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Email</label>
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
                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold"
                    loading={loading}
                  >
                    Gửi mã OTP
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleReset} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Mã OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="Nhập mã 6 số"
                        className="pl-9 tracking-widest"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Mật khẩu mới</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="Ít nhất 6 ký tự"
                        className="pl-9 pr-10"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="Nhập lại mật khẩu mới"
                        className="pl-9"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold"
                    loading={loading}
                  >
                    Đặt lại mật khẩu
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Chưa nhận được mã?{" "}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      Gửi lại
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <PublicRoute>
      <ForgotPasswordForm />
    </PublicRoute>
  );
}
