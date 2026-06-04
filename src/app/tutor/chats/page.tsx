"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { getConversations } from "@/api/chatApi";
import { getBookingById } from "@/api/bookingApi";
import type { Booking } from "@/types";
import { ChatBox, type BookingChatContext } from "@/components/shared/ChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";

type Conversation = Awaited<ReturnType<typeof getConversations>>[number];

function ChatsSkeleton() {
  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container grid gap-4 lg:grid-cols-[320px_1fr]">
          <Skeleton className="h-[620px] rounded-2xl" />
          <Skeleton className="h-[620px] rounded-2xl" />
        </div>
      </section>
    </main>
  );
}

function toBookingContext(booking: Booking): BookingChatContext {
  return {
    bookingId: booking.id,
    status: booking.status,
    bookingHref: `/tutor/bookings/${booking.id}`,
  };
}

function TutorChatsContent() {
  const searchParams = useSearchParams();
  const autoConvId = searchParams.get("convId");
  const bookingIdParam = searchParams.get("bookingId");

  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<BookingChatContext | null>(null);

  useEffect(() => {
    if (isLoading || !user || !user.tutorProfileId) return;

    let mounted = true;

    void getConversations(user.tutorProfileId, "tutor")
      .then((data) => {
        if (!mounted) return;
        const sorted = data.sort(
          (a, b) =>
            new Date(b.lastMessageAt ?? 0).getTime() - new Date(a.lastMessageAt ?? 0).getTime(),
        );
        setItems(sorted);
        setSelectedId(autoConvId ?? sorted[0]?.id ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [autoConvId, isLoading, user]);

  useEffect(() => {
    if (!user || !selectedId || !user.tutorProfileId) return;

    let mounted = true;

    const resolveContext = async () => {
      let booking: Booking | null = null;
      if (bookingIdParam && (!autoConvId || selectedId === autoConvId)) {
        booking = await getBookingById({ bookingId: bookingIdParam, tutorId: user.tutorProfileId });
      }
      if (!mounted) return;
      setChatContext(booking ? toBookingContext(booking) : null);
    };

    void resolveContext();

    return () => {
      mounted = false;
    };
  }, [autoConvId, bookingIdParam, selectedId, user]);

  const selectedConversation = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  if (isLoading || loading) return <ChatsSkeleton />;
  if (!user) return null;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MessageSquare className="h-4.5 w-4.5 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Tin nhắn phụ huynh</h1>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/tutor/bookings">Lịch dạy</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/tutor/schedule">Xem lịch</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="surface-card overflow-hidden">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-foreground">Hội thoại ({items.length})</h2>
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="mx-auto mb-2 h-5 w-5 opacity-40" />
                  Chưa có hội thoại nào.
                </div>
              ) : (
                <div className="max-h-[560px] divide-y divide-border overflow-y-auto">
                  {items.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full px-4 py-3 text-left transition-colors ${
                          active ? "bg-primary/10" : "hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">{item.parentName}</p>
                          {active && <Badge variant="outline">Dang xem</Badge>}
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.lastMessage || "Chua co tin nhan"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </aside>

            <section className="surface-card p-3 sm:p-4">
              {selectedConversation ? (
                <ChatBox
                  convId={selectedConversation.id}
                  currentUser={user}
                  otherName={selectedConversation.parentName}
                  bookingContext={chatContext ?? undefined}
                />
              ) : selectedId ? (
                <ChatBox
                  convId={selectedId}
                  currentUser={user}
                  otherName="Phu huynh"
                  bookingContext={chatContext ?? undefined}
                />
              ) : (
                <div className="flex h-[560px] items-center justify-center text-sm text-muted-foreground">
                  Chọn một hội thoại để bắt đầu.
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function TutorChatsPage() {
  return (
    <Suspense fallback={<ChatsSkeleton />}>
      <TutorChatsContent />
    </Suspense>
  );
}
