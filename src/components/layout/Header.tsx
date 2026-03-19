"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Shield,
  Users,
  BookOpen,
  UserCircle,
  UserCheck,
  CalendarDays,
  Flag,
  Wallet,
  Clock,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as firebaseLogout } from "@/api/authApi";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";

export function Header() {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await firebaseLogout();
    logout();
    document.cookie = "auth_role=; path=/; SameSite=Strict; max-age=0";
    setUserMenuOpen(false);
    setMenuOpen(false);
    router.push("/");
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === "parent") return "/dashboard/parent";
    if (user.role === "tutor") return "/dashboard/tutor";
    if (user.role === "tutorCandidate") return "/dashboard/tutor-candidate";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "guest") return "/dashboard/guest";
    return null;
  };

  const getProfileLink = () => {
    if (!user) return null;
    if (user.role === "tutor") return "/tutor/profile";
    if (user.role === "parent") return "/parent/profile";
    if (user.role === "tutorCandidate") return "/tutor-application";
    return getDashboardLink();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4" />;
      case "parent":
        return <Users className="h-4 w-4" />;
      case "tutor":
        return <BookOpen className="h-4 w-4" />;
      case "tutorCandidate":
        return <UserCheck className="h-4 w-4" />;
      case "guest":
        return <UserCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getRoleBadgeVariant = (
    role: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "destructive";
      case "parent":
        return "default";
      case "tutor":
        return "secondary";
      case "tutorCandidate":
        return "outline";
      case "guest":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleQuickLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case "tutor":
        return [
          {
            href: "/tutor/bookings",
            label: "Lịch dạy",
            icon: <CalendarDays className="h-5 w-5 text-primary" />,
          },
          {
            href: "/tutor/availability",
            label: "Lịch trống",
            icon: <Clock className="h-5 w-5 text-primary" />,
          },
          {
            href: "/tutor/wallet",
            label: "Ví thu nhập",
            icon: <Wallet className="h-5 w-5 text-primary" />,
          },
        ];
      case "parent":
        return [
          {
            href: "/parent/bookings",
            label: "Lịch học",
            icon: <CalendarDays className="h-5 w-5 text-primary" />,
          },
          {
            href: "/parent/wallet",
            label: "Ví của tôi",
            icon: <Wallet className="h-5 w-5 text-primary" />,
          },
          {
            href: "/parent/reports",
            label: "Báo cáo tranh chấp",
            icon: <Flag className="h-5 w-5 text-destructive" />,
          },
          {
            href: "/parent/profile",
            label: "Thông tin cá nhân",
            icon: <UserCircle className="h-5 w-5 text-primary" />,
          },
        ];
      case "tutorCandidate":
        return [
          {
            href: "/tutor-application",
            label: "Đơn ứng tuyển",
            icon: <UserCheck className="h-5 w-5 text-primary" />,
          },
        ];
      default:
        return [];
    }
  };

  const navLinks = [
    { href: "/", label: "Trang chủ", active: pathname === "/" },
    {
      href: "/tutors",
      label: "Tìm gia sư",
      active: pathname.startsWith("/tutors"),
    },
    { href: "/#how-it-works", label: "Cách hoạt động", active: false },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="site-container">
        <div className="flex h-20 items-center">
          <div className="flex flex-1 items-center">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-2xl font-bold sm:text-[1.9rem]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-foreground">
                LI<span className="text-accent">FLOW</span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {navLinks.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-xl px-5 py-3 text-base font-semibold transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="hidden flex-1 items-center justify-end gap-4 md:flex">
            {isLoading ? (
              <div className="h-11 w-44 animate-pulse rounded-xl bg-muted" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Mở menu tài khoản"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2.5 rounded-xl border border-border px-4 py-2.5 text-base font-medium transition-colors hover:bg-muted"
                >
                  <img
                    src={
                      user.avatarUrl ??
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                    }
                    alt={user.fullName}
                    className="h-7 w-7 rounded-full"
                  />
                  <span className="max-w-30 truncate">{user.fullName}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 opacity-60 transition-transform",
                      userMenuOpen && "rotate-180",
                    )}
                  />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-60 rounded-2xl border border-border bg-card p-1.5 shadow-lg shadow-primary/5">
                      <div className="mb-1 border-b border-border px-4 py-3">
                        <p className="truncate text-base font-medium text-foreground">
                          {user.fullName}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Badge
                            variant={getRoleBadgeVariant(user.role)}
                            className="h-6 px-2 text-xs"
                          >
                            <span className="mr-1">{getRoleIcon(user.role)}</span>
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </div>
                      </div>

                      {getDashboardLink() && (
                        <Link
                          href={getDashboardLink()!}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base transition-colors hover:bg-muted"
                        >
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                          Dashboard
                        </Link>
                      )}

                      {getRoleQuickLinks().map(({ href, label, icon }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base transition-colors hover:bg-muted"
                        >
                          {icon} {label}
                        </Link>
                      ))}

                      {user.role === "guest" && (
                        <>
                          <Link
                            href="/tutor-application"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base transition-colors hover:bg-muted"
                          >
                            <ClipboardList className="h-5 w-5 text-primary" />
                            Hồ sơ ứng tuyển
                          </Link>
                          <Link
                            href="/auth/select-role"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base text-primary transition-colors hover:bg-muted"
                          >
                            <Shield className="h-5 w-5" />
                            Chọn vai trò
                          </Link>
                        </>
                      )}

                      {getProfileLink() && (
                        <Link
                          href={getProfileLink()!}
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base transition-colors hover:bg-muted"
                        >
                          <User className="h-5 w-5 text-muted-foreground" />
                          Hồ sơ cá nhân
                        </Link>
                      )}

                      <div className="my-1.5 h-px bg-border" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-base text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-5 w-5" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/auth/login")}>
                  Đăng nhập
                </Button>
                <Button
                  className="shadow-sm shadow-primary/20"
                  onClick={() => router.push("/auth/register")}
                >
                  Đăng ký miễn phí
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            className="ml-auto rounded-xl p-3 transition-colors hover:bg-muted md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="space-y-2 border-t border-border bg-card px-5 py-5 md:hidden">
          {navLinks.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "block rounded-xl px-4 py-3 text-lg font-semibold transition-colors",
                active ? "bg-primary/10 text-primary" : "hover:bg-muted",
              )}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="mt-3 space-y-3 border-t border-border pt-4">
            {isLoading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                {getDashboardLink() && (
                  <Link href={getDashboardLink()!} onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === "guest" && (
                  <Link href="/tutor-application" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Hồ sơ ứng tuyển
                    </Button>
                  </Link>
                )}
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push("/auth/login");
                    setMenuOpen(false);
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push("/auth/register");
                    setMenuOpen(false);
                  }}
                >
                  Đăng ký miễn phí
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
