"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { CheckCircle2, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuestDashboardPage() {
  const { user } = useAuthStore();

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Chào mừng đến với LIFLOW!
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Xin chào <span className="font-semibold text-foreground">{user?.fullName}</span>,
              để sử dụng đầy đủ tính năng, vui lòng chọn vai trò của bạn.
            </p>
          </div>

          {/* Limited Access Notice */}
          <div className="rounded-2xl border border-border bg-card p-8 mb-8 shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  Tài khoản Khách (Guest)
                </h2>
                <p className="text-muted-foreground">
                  Hiện tại bạn đang sử dụng tài khoản khách với quyền hạn giới hạn.
                  Bạn chỉ có thể xem danh sách gia sư.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-foreground mb-3">
                Chức năng hiện có:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Xem danh sách gia sư
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Xem thông tin chi tiết gia sư
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/select-role" className="flex-1">
                <Button className="w-full h-12 text-base font-semibold">
                  Chọn vai trò ngay
                </Button>
              </Link>
              <Link href="/tutors" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-base">
                  Xem danh sách gia sư
                </Button>
              </Link>
            </div>
          </div>

          {/* Role Benefits */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Phụ huynh</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tìm kiếm và đặt lịch với gia sư phù hợp cho con em
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Đặt lịch học</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Quản lý lịch sử</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Đánh giá gia sư</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Nhắn tin trực tiếp</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Gia sư</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tạo hồ sơ và nhận lịch dạy từ phụ huynh
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Tạo hồ sơ gia sư</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Thiết lập lịch trống</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Nhận yêu cầu đặt lịch</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success shrink-0" /> Quản lý thu nhập</li>
              </ul>
              <Link href="/apply-tutor">
                <Button variant="outline" className="w-full">
                  Đăng ký làm gia sư
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
