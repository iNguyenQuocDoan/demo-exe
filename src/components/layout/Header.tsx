"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap, Menu, X, User, LogOut, LayoutDashboard,
  ChevronDown, Shield, Users, BookOpen, UserCheck, CalendarDays,
  Flag, Wallet, Clock, ClipboardList, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NotificationPanel } from "@/components/shared/NotificationPanel";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as firebaseLogout } from "@/api/authApi";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/permissions";

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/tutors", label: "Tìm gia sư" },
] as const;

export function Header() {
  const { user, logout, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* Pill indicator — tracks active nav item position */
  const navRef = useRef<HTMLElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  /* Update pill position whenever active link or layout changes */
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>("[data-active='true']");
    if (!el) { setPill(null); return; }
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPill({ left: elRect.left - navRect.left, width: elRect.width });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    const map: Record<string, string> = {
      parent: "/dashboard/parent",
      tutor: "/dashboard/tutor",
      tutorCandidate: "/dashboard/tutor-candidate",
      admin: "/dashboard/admin",
      guest: "/dashboard/guest",
    };
    return map[user.role] ?? null;
  };

  const getProfileLink = () => {
    if (!user) return null;
    if (user.role === "tutor") return "/tutor/profile";
    if (user.role === "parent") return "/parent/profile";
    if (user.role === "tutorCandidate") return "/tutor-application";
    return getDashboardLink();
  };

  const getRoleIcon = (role: string) => {
    const map: Record<string, React.ReactNode> = {
      admin: <Shield className="h-3.5 w-3.5" />,
      parent: <Users className="h-3.5 w-3.5" />,
      tutor: <BookOpen className="h-3.5 w-3.5" />,
      tutorCandidate: <UserCheck className="h-3.5 w-3.5" />,
      guest: <User className="h-3.5 w-3.5" />,
    };
    return map[role] ?? null;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    if (role === "admin") return "destructive";
    if (role === "parent") return "default";
    if (role === "tutor") return "secondary";
    return "outline";
  };

  const getRoleQuickLinks = () => {
    if (!user) return [];
    if (user.role === "tutor") return [
      { href: "/tutor/bookings", label: "Lịch dạy", icon: <CalendarDays className="h-4 w-4 text-primary" /> },
      { href: "/tutor/availability", label: "Lịch trống", icon: <Clock className="h-4 w-4 text-primary" /> },
      { href: "/tutor/wallet", label: "Ví thu nhập", icon: <Wallet className="h-4 w-4 text-primary" /> },
    ];
    if (user.role === "parent") return [
      { href: "/parent/bookings", label: "Lịch học", icon: <CalendarDays className="h-4 w-4 text-primary" /> },
      { href: "/parent/wallet", label: "Ví của tôi", icon: <Wallet className="h-4 w-4 text-primary" /> },
    ];
    if (user.role === "tutorCandidate") return [
      { href: "/tutor-application", label: "Đơn ứng tuyển", icon: <UserCheck className="h-4 w-4 text-primary" /> },
    ];
    return [];
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all",
        /* Transition: height, background, border-color, shadow */
        scrolled
          ? "border-b border-border/70 bg-card/96 shadow-sm shadow-black/4"
          : "border-b border-border/50 bg-card/88 shadow-sm shadow-black/3",
        /* Backdrop blur — only when scrolled to avoid mobile perf cost */
        scrolled ? "backdrop-blur-xl" : "backdrop-blur-md",
      )}
      style={{ transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease" }}
    >
      <div className="site-container">
        <div
          className="flex items-center"
          style={{
            height: scrolled ? "3.5rem" : "4.125rem",
            transition: "height 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* ── Logo ── */}
          <div className="flex flex-1 items-center">
            <Link href="/" className="group flex items-center gap-2.5 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
              <div
                className="flex items-center justify-center rounded-xl bg-primary shadow-sm shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-[1.06]"
                style={{
                  width: scrolled ? "2rem" : "2.25rem",
                  height: scrolled ? "2rem" : "2.25rem",
                  transition: "width 0.3s cubic-bezier(0.16,1,0.3,1), height 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <GraduationCap
                  className="text-primary-foreground transition-all duration-300"
                  style={{
                    width: scrolled ? "1.1rem" : "1.3rem",
                    height: scrolled ? "1.1rem" : "1.3rem",
                  }}
                />
              </div>
              <span
                className="font-extrabold tracking-tight text-foreground"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: scrolled ? "1.38rem" : "1.6rem",
                  letterSpacing: 0,
                  transition: "font-size 0.3s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                LI<span className="text-accent">FLOW</span>
              </span>
            </Link>
          </div>

          {/* ── Desktop nav with animated pill ── */}
          <nav ref={navRef} className="relative hidden items-center gap-0.5 md:flex">
            {/* Pill background — absolutely positioned, transitions on left/width */}
            {pill && (
              <span
                aria-hidden
                className="absolute inset-y-1 rounded-xl bg-primary/9 pointer-events-none"
                style={{
                  left: pill.left,
                  width: pill.width,
                  transition: "left 0.3s cubic-bezier(0.16,1,0.3,1), width 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}
              />
            )}
            {NAV_LINKS.map(({ href, label }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  data-active={active}
                  className={cn(
                    "relative z-10 rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* ── Desktop actions ── */}
          <div className="hidden flex-1 items-center justify-end gap-2.5 md:flex">
            {user && <NotificationPanel />}

            {isLoading ? (
              <div className="h-9 w-40 animate-pulse rounded-xl bg-muted" />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="Mở menu tài khoản"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
                    "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    userMenuOpen
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border hover:border-primary/25 hover:bg-muted/60 text-foreground",
                  )}
                >
                  <img
                    src={user.avatarUrl ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt={user.fullName}
                    className="h-6 w-6 rounded-full ring-2 ring-primary/15"
                  />
                  <span className="max-w-28 truncate">{user.fullName}</span>
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 opacity-45 transition-transform duration-200", userMenuOpen && "rotate-180")}
                  />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 min-w-56 rounded-2xl border border-border bg-card p-1.5 shadow-xl shadow-black/8 animate-scale-in">
                      {/* User header */}
                      <div className="border-b border-border px-3.5 py-3 mb-1">
                        <p className="truncate text-sm font-semibold text-foreground">{user.fullName}</p>
                        <div className="mt-1.5">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="h-5 px-2 text-[10px] gap-1">
                            {getRoleIcon(user.role)}
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </div>
                      </div>

                      {/* Menu items */}
                      {getDashboardLink() && (
                        <DropdownItem href={getDashboardLink()!} icon={<LayoutDashboard className="h-4 w-4 text-primary" />} onClick={() => setUserMenuOpen(false)}>
                          Dashboard
                        </DropdownItem>
                      )}

                      {user.role === "parent" && (
                        <DropdownItem
                          href="/parent/subscription"
                          icon={<Crown className="h-4 w-4 text-amber-500" />}
                          onClick={() => setUserMenuOpen(false)}
                          className="text-amber-700 dark:text-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50"
                        >
                          Nâng cấp Premium
                        </DropdownItem>
                      )}

                      {getRoleQuickLinks().map(({ href, label, icon }) => (
                        <DropdownItem key={href} href={href} icon={icon} onClick={() => setUserMenuOpen(false)}>
                          {label}
                        </DropdownItem>
                      ))}

                      {user.role === "guest" && (
                        <>
                          <DropdownItem href="/tutor-application" icon={<ClipboardList className="h-4 w-4 text-primary" />} onClick={() => setUserMenuOpen(false)}>
                            Hồ sơ ứng tuyển
                          </DropdownItem>
                          <DropdownItem href="/auth/select-role" icon={<Shield className="h-4 w-4 text-primary" />} onClick={() => setUserMenuOpen(false)}>
                            Chọn vai trò
                          </DropdownItem>
                        </>
                      )}

                      {getProfileLink() && (
                        <DropdownItem href={getProfileLink()!} icon={<User className="h-4 w-4 text-muted-foreground" />} onClick={() => setUserMenuOpen(false)}>
                          Hồ sơ cá nhân
                        </DropdownItem>
                      )}

                      {user.role === "parent" && (
                        <DropdownItem href="/parent/reports" icon={<Flag className="h-4 w-4 text-destructive" />} onClick={() => setUserMenuOpen(false)}>
                          Báo cáo tranh chấp
                        </DropdownItem>
                      )}

                      <div className="my-1.5 mx-1 h-px bg-border" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => router.push("/auth/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  size="sm"
                  className="btn-shimmer text-sm font-semibold shadow-sm shadow-primary/20 px-4"
                  onClick={() => router.push("/auth/register")}
                >
                  Đăng ký miễn phí
                </Button>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            className="ml-auto rounded-xl p-2.5 transition-colors hover:bg-muted md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />
            }
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 py-3 space-y-0.5 md:hidden animate-fade-in-up">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                  active ? "bg-primary/8 text-primary" : "text-foreground hover:bg-muted",
                )}
                onClick={() => setMenuOpen(false)}
              >
                {active && <span className="w-1 h-1 rounded-full bg-primary shrink-0" />}
                {label}
              </Link>
            );
          })}
          <div className="pt-3 pb-1 space-y-2 border-t border-border mt-2">
            {isLoading ? (
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <>
                {getDashboardLink() && (
                  <Link href={getDashboardLink()!} onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Dashboard</Button>
                  </Link>
                )}
                {user.role === "guest" && (
                  <Link href="/tutor-application" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Hồ sơ ứng tuyển</Button>
                  </Link>
                )}
                <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { router.push("/auth/login"); setMenuOpen(false); }}>
                  Đăng nhập
                </Button>
                <Button size="sm" className="w-full btn-shimmer" onClick={() => { router.push("/auth/register"); setMenuOpen(false); }}>
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

/* ── Dropdown item helper ── */
function DropdownItem({
  href,
  icon,
  onClick,
  children,
  className,
}: {
  href: string;
  icon: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      {icon}
      {children}
    </Link>
  );
}
