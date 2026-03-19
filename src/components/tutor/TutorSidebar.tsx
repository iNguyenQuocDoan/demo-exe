"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Flag,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Star,
  User,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as firebaseLogout } from "@/api/authApi";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/tutor", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/tutor/calendar", icon: CalendarDays, label: "Lịch của tôi" },
  { href: "/tutor/reports", icon: Flag, label: "Báo cáo tranh chấp" },
  { href: "/tutor/reviews", icon: Star, label: "Đánh giá" },
  { href: "/tutor/chats", icon: MessageSquare, label: "Tin nhắn" },
  { href: "/tutor/wallet", icon: Wallet, label: "Ví của tôi" },
  { href: "/tutor/profile", icon: User, label: "Hồ sơ" },
];

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await firebaseLogout();
    logout();
    router.push("/");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">
          LI<span className="text-amber-300">FLOW</span>
          <span className="ml-1.5 text-xs font-normal text-white/60">Gia sư</span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active =
            href === "/dashboard/tutor"
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNav}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          href="/"
          onClick={onNav}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/60 transition-all hover:bg-white/10 hover:text-white border border-white/10"
        >
          <Home className="h-4 w-4 shrink-0" />
          Về trang chủ
        </Link>
      </div>

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
                Gia sư
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

export function TutorSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:shrink-0 bg-gradient-to-b from-primary to-primary/90 fixed left-0 top-0 h-screen overflow-hidden z-40">
        <SidebarContent />
      </aside>

      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
        <Link
          href="/dashboard/tutor"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>
            LI<span className="text-accent">FLOW</span>{" "}
            <span className="text-xs font-normal text-muted-foreground">Gia sư</span>
          </span>
        </Link>
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

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-primary to-primary/90 lg:hidden">
            <div className="flex h-14 items-center justify-between px-5">
              <span className="text-lg font-bold text-white">Gia sư</span>
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
