"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  DollarSign,
  FileText,
  MapPin,
  Phone,
  Upload,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCities, getDistricts, getSubjects } from "@/api/referenceApi";
import type { City, District, Subject, TutorApplication, TeachingMode } from "@/types";

/* ─── File upload helper ──────────────────────────────────────────────────── */
async function uploadFiles(files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(
    files.map(async (file) => {
      console.log(
        "[upload] uploading:",
        file.name,
        "size:",
        file.size,
        "type:",
        file.type,
      );
      const form = new FormData();
      form.append("file", file);

      const { data } = await apiClient.post<{ ok: boolean; url: string }>(
        "/uploads/image",
        form,
      );
      console.log(
        "[upload] result ok:",
        data.ok,
        "url length:",
        data.url?.length,
      );
      return data.url;
    }),
  );
  const urls = results
    .filter(
      (r): r is PromiseFulfilledResult<string> => r.status === "fulfilled",
    )
    .map((r) => r.value);
  const failed = results.filter(
    (r) => r.status === "rejected",
  ) as PromiseRejectedResult[];
  if (failed.length > 0) {
    console.error(
      "[upload] failed uploads:",
      failed.map((r) => r.reason),
    );
  }
  return urls;
}

/* ─── Static data (fallback grade options when reference API is empty) ───────────────────────────────── */
const DEFAULT_GRADES = [
  "Lớp 1",
  "Lớp 2",
  "Lớp 3",
  "Lớp 4",
  "Lớp 5",
  "Lớp 6",
  "Lớp 7",
  "Lớp 8",
  "Lớp 9",
  "Lớp 10",
  "Lớp 11",
  "Lớp 12",
  "Luyện thi THPT",
  "Luyện thi Đại học",
];

const STEPS = [
  { num: 1, label: "Thông tin cá nhân", icon: User },
  { num: 2, label: "Học vấn & Kinh nghiệm", icon: Award },
  { num: 3, label: "Môn dạy & Khu vực", icon: BookOpen },
  { num: 4, label: "Xác thực & Nộp hồ sơ", icon: FileText },
];

/* ─── Props ───────────────────────────────────────────────────────────────── */
interface Props {
  userId: string;
  userEmail: string;
  userName: string;
  onSubmit?: (
    data: Omit<TutorApplication, "id" | "status" | "submittedAt">,
  ) => Promise<{ ok: boolean; error?: string }>;
}

/* ─── FileUploadZone ──────────────────────────────────────────────────────── */
function FileUploadZone({
  id,
  label,
  required,
  files,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const previews = useMemo(
    () =>
      files.map((f) => ({
        name: f.name,
        url: URL.createObjectURL(f),
        isImage: f.type.startsWith("image/"),
      })),
    [files],
  );

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const imagePreviews = previews.filter((p) => p.isImage);
  const pdfPreviews = previews.filter((p) => !p.isImage);

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative border-2 border-dashed border-border rounded-xl hover:border-primary transition-colors">
        <input
          type="file"
          id={id}
          aria-label={label}
          multiple
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={(e) =>
            onChange(e.target.files ? Array.from(e.target.files) : [])
          }
        />
        <div className="p-4 pointer-events-none">
          {files.length > 0 ? (
            <div className="space-y-3">
              {/* Image thumbnails */}
              {imagePreviews.length > 0 && (
                <div
                  className={`grid gap-2 ${imagePreviews.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
                >
                  {imagePreviews.map((p) => (
                    <div
                      key={p.name}
                      className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted"
                    >
                      <img
                        src={p.url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
              {/* PDF list */}
              {pdfPreviews.length > 0 && (
                <ul className="space-y-1">
                  {pdfPreviews.map((p) => (
                    <li
                      key={p.name}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <FileText className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground text-center">
                {files.length} file đã chọn · Click để thay đổi
              </p>
            </div>
          ) : (
            <div className="text-center py-2">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Kéo thả hoặc click để tải file
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                JPG, PNG, PDF — tối đa 5 MB/file
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */
export function TutorApplicationForm({
  userId,
  userEmail,
  userName,
  onSubmit,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: userName,
    email: userEmail,
    phone: "",
    idCard: "",
    education: "",
    degree: "",
    experience: "",
    bio: "",
    subjects: [] as string[],
    grades: [] as string[],
    teachingMode: "OFFLINE" as TeachingMode,
    pricePerHour: 150000,
    cityId: "",
    districtIds: [] as string[],
  });

  const [files, setFiles] = useState({
    idCardImages: [] as File[],
    degreeImages: [] as File[],
    certificateImages: [] as File[],
  });
  const [cityOptions, setCityOptions] = useState<City[]>([]);
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);

  const gradeOptions = useMemo(() => {
    const grades = Array.from(
      new Set(subjectOptions.flatMap((subject) => subject.grades ?? []))
    );
    return grades.length > 0 ? grades : DEFAULT_GRADES;
  }, [subjectOptions]);

  const set = (patch: Partial<typeof form>) =>
    setForm((f) => ({ ...f, ...patch }));

  const toggle = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

  useEffect(() => {
    let active = true;
    void Promise.all([getCities(), getSubjects()]).then(([cities, subjects]) => {
      if (!active) return;
      setCityOptions(cities);
      setSubjectOptions(subjects);
      setForm((prev) => {
        if (prev.cityId && cities.some((city) => city.id === prev.cityId)) {
          return prev;
        }
        return {
          ...prev,
          cityId: cities[0]?.id ?? "",
          districtIds: [],
        };
      });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!form.cityId) {
      setDistrictOptions([]);
      return;
    }

    let active = true;
    void getDistricts(form.cityId).then((districts) => {
      if (!active) return;
      setDistrictOptions(districts);
      const validIds = new Set(districts.map((district) => district.id));
      setForm((prev) => {
        const kept = prev.districtIds.filter((districtId) => validIds.has(districtId));
        // Auto-select all districts when city changes (kept is empty = new city selected)
        return { ...prev, districtIds: kept.length > 0 ? kept : districts.map((d) => d.id) };
      });
    });

    return () => {
      active = false;
    };
  }, [form.cityId]);

  /* Validation per step */
  const validate = (): string => {
    if (step === 1) {
      if (!form.fullName.trim()) return "Vui lòng nhập họ và tên.";
      if (!form.phone.trim()) return "Vui lòng nhập số điện thoại.";
      if (!form.idCard.trim()) return "Vui lòng nhập số CCCD/ID.";
    }
    if (step === 2) {
      if (!form.education.trim()) return "Vui lòng nhập trình độ học vấn.";
      if (!form.degree.trim()) return "Vui lòng nhập bằng cấp chính.";
      if (!form.experience.trim())
        return "Vui lòng mô tả kinh nghiệm giảng dạy.";
      if (!form.bio.trim()) return "Vui lòng viết giới thiệu bản thân.";
    }
    if (step === 3) {
      if (!form.cityId) return "Vui long chon thanh pho day.";
      if (form.subjects.length === 0) return "Vui lòng chọn ít nhất 1 môn dạy.";
      if (form.grades.length === 0) return "Vui lòng chọn ít nhất 1 khối lớp.";
      if (form.districtIds.length === 0)
        return "Vui lòng chọn ít nhất 1 khu vực dạy.";
      if (form.pricePerHour < 50000) return "Học phí tối thiểu 50.000 VNĐ/giờ.";
    }
    if (step === 4) {
      if (files.idCardImages.length === 0)
        return "Vui lòng tải ảnh CCCD/ID (2 mặt).";
    }
    return "";
  };

  const next = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const [idCardUrls, degreeUrls, certUrls] = await Promise.all([
        uploadFiles(files.idCardImages),
        uploadFiles(files.degreeImages),
        uploadFiles(files.certificateImages),
      ]);

      console.log(
        "[submit] idCardUrls:",
        idCardUrls.length,
        "degreeUrls:",
        degreeUrls.length,
        "certUrls:",
        certUrls.length,
      );
      if (idCardUrls.length === 0) {
        setError("Tải ảnh CCCD thất bại. Vui lòng thử lại.");
        return;
      }

      const result = await onSubmit?.({
        ...form,
        userId,
        idCardImages: idCardUrls,
        degreeImages: degreeUrls,
        certificateImages: certUrls,
        certificates: [],
      });

      if (result?.ok) {
        router.push("/tutor-application");
      } else {
        setError(result?.error ?? "Không thể nộp hồ sơ. Vui lòng thử lại.");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ??
        (err instanceof Error
          ? err.message
          : "Có lỗi xảy ra. Vui lòng thử lại.");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="flex items-start gap-0">
        {STEPS.map((s, idx) => {
          const done = step > s.num;
          const active = step === s.num;
          const Icon = s.icon;
          return (
            <div key={s.num} className="flex-1 flex flex-col items-center">
              <div className="flex w-full items-center">
                {idx > 0 && (
                  <div
                    className={`flex-1 h-0.5 ${done || active ? "bg-primary" : "bg-muted"}`}
                  />
                )}
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary bg-primary/5"
                        : "border-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 ${done ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
              <span
                className={`mt-2 text-xs text-center px-1 leading-tight ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Step 1: Thông tin cá nhân ─────────────────────────────────────── */}
      {step === 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.fullName}
                  onChange={(e) => set({ fullName: e.target.value })}
                  placeholder="Nguyễn Thị Lan"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input value={form.email} disabled className="bg-muted/50" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set({ phone: e.target.value })}
                  placeholder="0901 234 567"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Số CCCD / CMND <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.idCard}
                  onChange={(e) => set({ idCard: e.target.value })}
                  placeholder="001234567890"
                  maxLength={12}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Học vấn & Kinh nghiệm ────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5 text-primary" />
              Học vấn & Kinh nghiệm
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-800">
              <span className="font-semibold">Bạn là sinh viên?</span> Hoàn toàn được chào đón!
              Chỉ cần điền trung thực — nhiều phụ huynh tìm gia sư sinh viên vì nhiệt tình và gần gũi với học sinh.
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Trình độ học vấn <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.education}
                  onChange={(e) => set({ education: e.target.value })}
                  placeholder="Ví dụ: Cao đẳng Sư phạm / Cử nhân ĐHSP"
                />
                <p className="text-xs text-muted-foreground">
                  Ghi rõ ngành học và trường đào tạo nếu có
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Bằng cấp / Trình độ hiện tại <span className="text-destructive">*</span>
                </label>
                <Input
                  value={form.degree}
                  onChange={(e) => set({ degree: e.target.value })}
                  placeholder="THPT / Đang học ĐH năm 3 / Cử nhân / Thạc sĩ..."
                />
                <p className="text-xs text-muted-foreground">
                  Sinh viên ghi: &quot;Đang học [Tên trường] — năm [X]&quot;
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Kinh nghiệm giảng dạy{" "}
                <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.experience}
                onChange={(e) => set({ experience: e.target.value })}
                placeholder="Chưa có kinh nghiệm / 1 năm / 3 năm..."
              />
              <p className="text-xs text-muted-foreground">
                Sinh viên chưa có kinh nghiệm có thể ghi &quot;Mới bắt đầu&quot; hoặc mô tả việc từng kèm bạn bè, em họ
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Giới thiệu bản thân <span className="text-destructive">*</span>
              </label>
              <textarea
                className="w-full min-h-32 rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={form.bio}
                onChange={(e) => set({ bio: e.target.value })}
                placeholder="Ví dụ: Mình là SV năm 3 ĐH Bách Khoa, từng kèm em họ môn Toán 2 năm. Mình kiên nhẫn, giải thích từng bước và hay dùng ví dụ thực tế để học sinh dễ hiểu..."
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.bio.length}/500
              </p>
            </div>

            {/* ── Tải lên bằng cấp & chứng chỉ ─────────────────────────── */}
            <div className="border-t border-border pt-5 space-y-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-primary" />
                Bằng cấp & Chứng chỉ
              </p>
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
                <span className="font-semibold">Sinh viên chưa tốt nghiệp:</span> Có thể upload{" "}
                <span className="font-medium">bảng điểm, giấy xác nhận sinh viên</span> thay cho bằng cấp.
                Chứng chỉ thêm (IELTS, HSK…) sẽ giúp hồ sơ nổi bật hơn.
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <FileUploadZone
                  id="degree"
                  label="Bằng cấp / Bảng điểm / Giấy XN sinh viên"
                  files={files.degreeImages}
                  onChange={(f) => setFiles((x) => ({ ...x, degreeImages: f }))}
                />
                <FileUploadZone
                  id="cert"
                  label="Chứng chỉ bổ sung (IELTS, HSK, tin học…)"
                  files={files.certificateImages}
                  onChange={(f) =>
                    setFiles((x) => ({ ...x, certificateImages: f }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Hỗ trợ JPG, PNG, PDF · Tối đa 10 MB/file · Ảnh rõ nét giúp hồ sơ
                được duyệt nhanh hơn
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3: Môn dạy, Khu vực & Giá ──────────────────────────────── */}
      {step === 3 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              Môn dạy, Khu vực & Giá
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Subjects */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Môn dạy <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {subjectOptions.map((s) => (
                  <Badge
                    key={s.id}
                    variant={
                      form.subjects.includes(s.id) ? "default" : "outline"
                    }
                    className="cursor-pointer select-none text-sm px-3 py-1"
                    onClick={() =>
                      set({ subjects: toggle(form.subjects, s.id) })
                    }
                  >
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Grades */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Khối lớp <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {gradeOptions.map((g) => (
                  <Badge
                    key={g}
                    variant={form.grades.includes(g) ? "default" : "outline"}
                    className="cursor-pointer select-none text-xs px-2.5 py-1"
                    onClick={() => set({ grades: toggle(form.grades, g) })}
                  >
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Teaching mode — OFFLINE only */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hình thức dạy</label>
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                Trực tiếp (tại nhà học sinh)
              </div>
            </div>

            {/* Service areas */}
            <div className="space-y-3 border-t border-border pt-4">
              <label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Khu vực dạy <span className="text-destructive">*</span>
              </label>

              {/* City select */}
              <div className="flex gap-2">
                {cityOptions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => set({ cityId: c.id, districtIds: [] })}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      form.cityId === c.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* Districts */}
              <div className="flex flex-wrap gap-2">
                {districtOptions.map((d) => (
                  <Badge
                    key={d.id}
                    variant={
                      form.districtIds.includes(d.id) ? "default" : "outline"
                    }
                    className="cursor-pointer select-none text-sm px-3 py-1"
                    onClick={() =>
                      set({ districtIds: toggle(form.districtIds, d.id) })
                    }
                  >
                    {d.name}
                  </Badge>
                ))}
              </div>
              {form.districtIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Đã chọn {form.districtIds.length} khu vực
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5 border-t border-border pt-4">
              <label className="text-sm font-medium flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                Học phí / giờ (VNĐ) <span className="text-destructive">*</span>
              </label>
              <Input
                type="number"
                value={form.pricePerHour}
                onChange={(e) => set({ pricePerHour: Number(e.target.value) })}
                min={50000}
                step={10000}
              />
              <p className="text-xs text-muted-foreground">
                Hiển thị trên card:{" "}
                <span className="font-semibold text-primary">
                  {form.pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 4: Bằng cấp & Xác nhận ──────────────────────────────────── */}
      {step === 4 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" />
              Xác thực danh tính & Nộp hồ sơ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <FileUploadZone
              id="idcard"
              label="Ảnh CCCD / CMND (2 mặt)"
              required
              files={files.idCardImages}
              onChange={(f) => setFiles((x) => ({ ...x, idCardImages: f }))}
            />

            {/* Summary preview */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2 text-sm">
              <p className="font-semibold text-foreground mb-3">
                Tóm tắt hồ sơ
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-muted-foreground">
                <span>Họ tên:</span>{" "}
                <span className="text-foreground font-medium">
                  {form.fullName}
                </span>
                <span>Học vấn:</span>{" "}
                <span className="text-foreground font-medium">
                  {form.education}
                </span>
                <span>Kinh nghiệm:</span>{" "}
                <span className="text-foreground font-medium">
                  {form.experience}
                </span>
                <span>Môn dạy:</span>{" "}
                <span className="text-foreground font-medium">
                  {form.subjects.length} môn
                </span>
                <span>Khu vực:</span>{" "}
                <span className="text-foreground font-medium">
                  {form.districtIds.length} quận/huyện
                </span>
                <span>Học phí:</span>{" "}
                <span className="text-primary font-bold">
                  {form.pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
              Hồ sơ sẽ được admin xét duyệt trong 1–3 ngày làm việc. Bạn có thể
              theo dõi trạng thái tại trang hồ sơ.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setStep((s) => s - 1);
            }}
          >
            Quay lại
          </Button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <Button onClick={next} className="min-w-32">
            Tiếp tục
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={submitting}
            className="min-w-32"
          >
            Nộp hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
}




