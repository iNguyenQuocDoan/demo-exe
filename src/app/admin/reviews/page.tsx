"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import { getTutorNameMap } from "@/api/referenceApi";
import { getAllReviews } from "@/api/reviewApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import type { Review } from "@/types";

export default function AdminReviewsPage() {
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [tutorMap, setTutorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);

    const load = async () => {
      const data = await getAllReviews();
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      const tutorIds = Array.from(new Set(sorted.map((item) => item.tutorId)));
      const tutorNames = await getTutorNameMap(tutorIds);
      if (!mounted) return;
      setReviews(sorted);
      setTutorMap(tutorNames);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reviews;
    return reviews.filter((item) => {
      const tutor = (tutorMap[item.tutorId] ?? item.tutorId).toLowerCase();
      return (
        item.comment.toLowerCase().includes(q) ||
        item.parentName.toLowerCase().includes(q) ||
        tutor.includes(q)
      );
    });
  }, [reviews, search, tutorMap]);

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-[var(--bg-app)]">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-5">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Kiểm duyệt đánh giá</h1>
                <p className="text-sm text-muted-foreground">Theo dõi feedback giữa phụ huynh và gia sư.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            </div>
          </header>

          <div className="surface-card p-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo người viết, gia sư, nội dung..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <section className="surface-card overflow-hidden">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-foreground">Danh sách đánh giá ({filtered.length})</h2>
            </div>
            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">Không có đánh giá phù hợp.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <article key={item.id} className="space-y-2 px-5 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.parentName}</p>
                      <span className="text-xs text-muted-foreground">-&gt; {tutorMap[item.tutorId] ?? item.tutorId}</span>
                      <Badge variant="outline">Buổi học #{item.bookingId}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${star <= item.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.comment}</p>
                    {item.tutorReply && (
                      <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Tutor reply</p>
                        <p className="mt-1">{item.tutorReply.text}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
