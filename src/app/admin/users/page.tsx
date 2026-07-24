"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Users, Ban, Check } from "lucide-react";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeaderCompact } from "@/components/shared/PageHeaderCompact";
import { FilterBarCompact } from "@/components/shared/FilterBarCompact";
import { AdvancedFiltersSheet } from "@/components/shared/AdvancedFiltersSheet";
import { SkeletonList } from "@/components/shared/SkeletonList";
import { ROLE_LABELS } from "@/lib/permissions";
import { getUsers, updateUserStatus } from "@/api/usersApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { User, UserRole } from "@/types";

const ALL_ROLES = ["guest", "parent", "tutor", "tutorCandidate", "admin"] as const;

export default function AdminUsersPage() {
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Khoá/mở tài khoản — PUT /users/{id}/status (BE thật). Cập nhật lạc quan.
  const toggleBlock = async (target: User) => {
    const block = target.active !== false; // đang hoạt động → khoá
    setBusyId(target.id);
    const result = await updateUserStatus(target.id, block);
    setBusyId(null);
    if (result.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === target.id ? { ...u, active: !block } : u)),
      );
    }
  };

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);
    void getUsers()
      .then((data) => {
        if (!mounted) return;
        setUsers(data.sort((a, b) => (a.fullName || "").localeCompare(b.fullName || "")));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== "ALL") result = result.filter((u) => u.role === roleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.fullName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q),
      );
    }
    return result;
  }, [search, roleFilter, users]);

  const roleStats = useMemo(() => {
    const base: Record<UserRole, number> = {
      guest: 0,
      parent: 0,
      tutor: 0,
      tutorCandidate: 0,
      admin: 0,
    };
    users.forEach((item) => {
      base[item.role] = (base[item.role] ?? 0) + 1;
    });
    return base;
  }, [users]);

  const activeCount = roleFilter !== "ALL" ? 1 : 0;

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <PageHeaderCompact
            title="Quản lý người dùng"
            description="Thống kê role và tra cứu tài khoản trên hệ thống."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            }
          />

          {/* Role stats — compact 5-col grid */}
          <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {ALL_ROLES.map((role) => (
              <article key={role} className="surface-card p-4">
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{roleStats[role]}</p>
              </article>
            ))}
          </section>

          <FilterBarCompact
            searchValue={search}
            onSearchChange={setSearch}
            summary={
              loading
                ? "Đang tải..."
                : `${filtered.length} tài khoản${roleFilter !== "ALL" ? ` · ${ROLE_LABELS[roleFilter as UserRole]}` : ""}`
            }
            activeCount={activeCount}
            onOpenAdvanced={() => setAdvancedOpen(true)}
          />

          <AdvancedFiltersSheet
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
            title="Lọc theo role"
            description="Chọn role để lọc danh sách tài khoản."
            onApply={() => setAdvancedOpen(false)}
            onReset={() => {
              setRoleFilter("ALL");
              setAdvancedOpen(false);
            }}
          >
            <div className="space-y-2">
              <p className="text-sm font-medium">Role</p>
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  {ALL_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AdvancedFiltersSheet>

          {/* Content — skeleton hoặc list, không bao giờ null */}
          {loading ? (
            <SkeletonList rows={8} />
          ) : (
            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Danh sách tài khoản ({filtered.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">{item.fullName}</p>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                      <p className="text-[11px] text-muted-foreground/80">ID: {item.id}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={item.role === "admin" ? "destructive" : "outline"}>
                        {ROLE_LABELS[item.role]}
                      </Badge>
                      {item.active === false && (
                        <Badge variant="secondary">Đã khoá</Badge>
                      )}
                      {item.role === "admin" && (
                        <ShieldCheck className="h-4 w-4 text-destructive" />
                      )}
                      {item.id !== user?.id && (
                        <Button
                          size="sm"
                          variant={item.active === false ? "outline" : "destructive"}
                          className="gap-1.5"
                          loading={busyId === item.id}
                          onClick={() => void toggleBlock(item)}
                        >
                          {item.active === false ? (
                            <><Check className="h-3.5 w-3.5" /> Mở khoá</>
                          ) : (
                            <><Ban className="h-3.5 w-3.5" /> Khoá</>
                          )}
                        </Button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
