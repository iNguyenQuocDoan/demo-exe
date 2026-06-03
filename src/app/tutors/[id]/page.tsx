"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  MessageSquare,
  Repeat2,
  Star,
  Award,
  BookMarked,
} from "lucide-react";
import { getDistrictMap, getSubjectMap } from "@/api/referenceApi";
import { getReviews, getTutorById } from "@/api/tutorApi";
import { JsonLd } from "@/components/seo/JsonLd";
import { tutorJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { getBookings } from "@/api/bookingApi";
import { AvailabilityCalendar } from "@/components/shared/AvailabilityCalendar";
import { BookingModal } from "@/components/shared/BookingModal";
import { ChatModal } from "@/components/shared/ChatModal";
import { RecurringModal } from "@/components/shared/RecurringModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import type { FreeSlot, Review, TutorProfile } from "@/types";
import { format } from "date-fns";

export default function TutorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
  const [districtMap, setDistrictMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [busySlots, setBusySlots] = useState<{ date: string; startTime: string }[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<FreeSlot | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;

    void Promise.all([
      getTutorById(id),
      getReviews(id),
      getSubjectMap(),
      getDistrictMap(),
      getBookings({ tutorId: id }).catch(() => []),
    ]).then(([tutorData, reviewData, subjects, districts, bookings]) => {
      if (!active) return;
      setTutor(tutorData);
      setReviews(reviewData);
      setSubjectMap(subjects);
      setDistrictMap(districts);
      // Extract busy slots from Confirmed/Pending bookings
      const busy = bookings
        .filter((b) => b.status === "Confirmed" || b.status === "Pending" || b.status === "InProgress")
        .map((b) => ({
          date: format(new Date(b.startAt), "yyyy-MM-dd"),
          startTime: format(new Date(b.startAt), "HH:mm"),
        }));
      setBusySlots(busy);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <TutorDetailSkeleton />;

  if (!tutor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-app)]">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-semibold">Không tìm thấy gia sư</h2>
          <Button asChild variant="outline">
            <Link href="/tutors">Quay lại danh sách</Link>
          </Button>
        </div>
      </div>
    );
  }

  const districts = tutor.serviceAreas.districtIds.map((districtId) => districtMap[districtId] ?? districtId);

  const subjectNames = tutor.subjects.map((sid) => subjectMap[sid] ?? sid);

  return (
    <main className="min-h-screen bg-[var(--bg-app)]">
      <JsonLd
        data={[
          tutorJsonLd({
            id: tutor.id,
            fullName: tutor.fullName,
            bio: tutor.bio,
            avatarUrl: tutor.avatarUrl,
            subjects: subjectNames,
            pricePerHour: tutor.pricePerHour,
            ratingAvg: tutor.ratingAvg,
            reviewCount: reviews.length,
          }),
          breadcrumbJsonLd([
            { name: "Trang chủ", url: "/" },
            { name: "Gia sư", url: "/tutors" },
            { name: tutor.fullName, url: `/tutors/${tutor.id}` },
          ]),
        ]}
      />
      <div className="site-container py-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-5 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-5 sm:flex-row">
                  <img
                    src={tutor.avatarUrl}
                    alt={tutor.fullName}
                    className="h-24 w-24 rounded-2xl border border-border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{tutor.fullName}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{tutor.education}</p>
                      </div>
                      <Badge variant="default">Trực tiếp</Badge>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <div className="inline-flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-semibold">{tutor.ratingAvg}</span>
                        <span className="text-muted-foreground">({tutor.reviewCount} đánh giá)</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {tutor.experience} kinh nghiệm
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />
                        Dạy lớp {tutor.grades.join(", ")}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {tutor.subjects.map((subjectId) => (
                        <Badge key={subjectId} variant="secondary">
                          {subjectMap[subjectId] ?? subjectId}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {tutor.bio && (
                  <p className="mt-5 border-t border-border pt-4 text-sm leading-relaxed text-muted-foreground">
                    {tutor.bio}
                  </p>
                )}

                {/* Học vấn & Chứng chỉ */}
                <div className="mt-5 border-t border-border pt-4 space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" /> Học vấn &amp; Chứng chỉ
                  </h3>
                  <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Bằng cấp</p>
                      <p className="text-sm font-medium text-foreground">{tutor.education}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-muted/50 border border-border px-4 py-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <BookMarked className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Kinh nghiệm giảng dạy</p>
                      <p className="text-sm font-medium text-foreground">{tutor.experience}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="availability" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="availability" className="flex-1 gap-2">
                  <CalendarDays className="h-4 w-4" /> Lịch trống
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1 gap-2">
                  <MessageSquare className="h-4 w-4" /> Đánh giá ({reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="availability">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="mb-4 text-base font-semibold text-foreground">Chọn khung giờ</h3>
                    <AvailabilityCalendar
                      tutorId={tutor.id}
                      selectedSlot={selectedSlot}
                      busySlots={busySlots}
                      onSelectSlot={(slot) => {
                        setSelectedSlot(slot);
                        if (!bookingOpen) setBookingOpen(true);
                      }}
                    />
                    {selectedSlot && (
                      <div className="mt-4 rounded-lg bg-primary/10 p-3 text-sm">
                        <span className="font-medium text-primary">Đã chọn: </span>
                        <span className="text-foreground">
                          {selectedSlot.date} - {selectedSlot.startTime} - {selectedSlot.endTime}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardContent className="space-y-4 p-5">
                    {reviews.length === 0 ? (
                      <p className="py-6 text-center text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium">{review.parentName}</span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-3.5 w-3.5 ${
                                    index < review.rating ? "fill-warning text-warning" : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                          <p className="mt-1 text-xs text-muted-foreground/80">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <Card className="lg:sticky lg:top-22">
              <CardContent className="p-5">
                <div className="mb-4 text-center">
                  <div className="text-3xl font-bold text-primary">{formatCurrency(tutor.pricePerHour)}</div>
                  <div className="text-sm text-muted-foreground">/ giờ</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    ~{formatCurrency(Math.round(tutor.pricePerHour * 1.5 * 1.1))} / buổi 90 phút (gồm phí)
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      setBookingOpen(true);
                      setSelectedSlot(null);
                    }}
                  >
                    <CalendarDays className="h-4 w-4" /> Đặt buổi học
                  </Button>
                  <Button className="w-full gap-2" variant="outline" onClick={() => setRecurringOpen(true)}>
                    <Repeat2 className="h-4 w-4" /> Đặt lịch định kỳ
                  </Button>
                  <Button className="w-full gap-2" variant="secondary" onClick={() => setChatOpen(true)}>
                    <MessageSquare className="h-4 w-4" /> Chat với gia sư
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h4 className="mb-3 text-sm font-semibold text-foreground">Khu vực dạy học</h4>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div className="flex flex-wrap gap-1.5">
                    {districts.map((district) => (
                      <Badge key={district} variant="secondary" className="text-xs">
                        {district}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {bookingOpen && (
        <BookingModal
          tutor={tutor}
          preSelectedSlot={selectedSlot}
          onClose={() => {
            setBookingOpen(false);
            setSelectedSlot(null);
          }}
        />
      )}

      {recurringOpen && <RecurringModal tutor={tutor} onClose={() => setRecurringOpen(false)} />}
      {chatOpen && <ChatModal tutor={tutor} onClose={() => setChatOpen(false)} />}
    </main>
  );
}

function TutorDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[var(--bg-app)]">
      <div className="site-container py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-5">
                  <Skeleton className="h-24 w-24 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-7 w-56" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Skeleton className="h-84 rounded-2xl" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
