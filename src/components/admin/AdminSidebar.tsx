"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  CreditCard,
  FileText,
  Flag,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as firebaseLogout } from "@/api/authApi";
import { getReports } from "@/api/reportApi";
import { NotificationPanel } from "@/components/shared/NotificationPanel";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/admin", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/admin/applications", icon: GraduationCap, label: "Hồ sơ ứng tuyển" },
  { href: "/admin/payments", icon: CreditCard, label: "Thanh toán" },
  { href: "/admin/bookings", icon: BookOpen, label: "Booking" },
  { href: "/admin/disputes", icon: Flag, label: "Tranh chấp", badgeKey: "disputes" as const },
  { href: "/admin/users", icon: Users, label: "Người dùng" },
  { href: "/admin/reviews", icon: FileText, label: "Đánh giá" },
  { href: "/admin/reports", icon: BarChart3, label: "Báo cáo" },
  { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [pendingDisputes, setPendingDisputes] = useState(0);

  useEffect(() => {
    getReports({ status: "Pending" })
      .then((r) => setPendingDisputes(r.total))
      .catch(() => {});
  }, [pathname]); // re-check when navigating

  const handleLogout = async () => {
    await firebaseLogout();
    logout();
    router.push("/");
  };

  const badges: Record<string, number> = {
    disputes: pendingDisputes,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-white/20">
          <Image src="/logo.png" alt="LIFLOW" fill sizes="36px" className="object-contain" />
        </div>
        <span className="text-lg font-bold text-white">
          LI<span className="text-amber-300">FLOW</span>
          <span className="ml-1.5 text-xs font-normal text-white/60">Admin</span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badgeKey }) => {
          const active =
            href === "/dashboard/admin"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          const badgeCount = badgeKey ? (badges[badgeKey] ?? 0) : 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{label}</span>
              {badgeCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                  {badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        {user && (
          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2">
            <img
              src={
                user.avatarUrl ??
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
              }
              alt={user.fullName}
              className="h-8 w-8 rounded-full ring-2 ring-white/20"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <Badge
                variant="secondary"
                className="mt-0.5 h-4 bg-white/10 text-white/60 text-[10px]"
              >
                Admin
              </Badge>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:shrink-0 bg-gradient-to-b from-primary to-primary/90 fixed left-0 top-0 h-screen overflow-y-auto z-40">
        <SidebarContent />
      </aside>

      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg">
            <Image src="/logo.png" alt="LIFLOW" fill sizes="32px" className="object-contain" />
          </span>
          <span>
            LI<span className="text-accent">FLOW</span>{" "}
            <span className="text-xs font-normal text-muted-foreground">Admin</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationPanel />
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary to-primary/90 lg:hidden">
            <div className="flex h-14 items-center justify-between px-5">
              <span className="text-lg font-bold text-white">Admin</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent onNav={() => setMobileOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
