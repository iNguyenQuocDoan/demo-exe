"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  MapPin,
  Phone,
  Save,
  Trash2,
  Upload,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CertificateViewer,
  certificateFileName,
} from "@/components/shared/CertificateViewer";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getMyTutorProfile,
  updateTutorProfile,
  updateUserProfile,
  removeTutorCertificate,
  type BeTutorDetail,
  type TutorVerificationStatus,
} from "@/api/tutorApi";
import {
  getSubjects,
  getAcademicLevels,
  getCities,
  getDistricts,
  type AcademicLevel,
} from "@/api/referenceApi";
import type { Subject, City, District } from "@/types";

// ── Trạng thái hồ sơ ─────────────────────────────────────────────────────────
const STATUS_MAP: Record<
  TutorVerificationStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  NOT_VERIFIED: {
    label: "Chưa gửi hồ sơ xác minh",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    icon: AlertCircle,
  },
  PENDING: {
    label: "Hồ sơ đang chờ admin duyệt",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  APPROVED: {
    label: "Hồ sơ gia sư đã được duyệt",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  REJECTED: {
    label: "Hồ sơ bị từ chối",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
};

// Tìm academicLevel ID từ tên (vì BE trả về tên, nhưng submit cần ID số)
function findAcademicLevelId(
  levels: AcademicLevel[],
  name: string | undefined,
): number | undefined {
  if (!name) return undefined;
  const found = levels.find((l) => l.name === name);
  return found ? Number(found.id) : undefined;
}

// Tìm subject IDs từ tên (vì BE trả về tên, nhưng submit cần array ID số)
function findSubjectIds(subjects: Subject[], names: string[]): number[] {
  return names
    .map((n) => {
      const found = subjects.find((s) => s.name === n);
      return found ? Number(found.id) : NaN;
    })
    .filter((id) => !isNaN(id));
}

export default function ApplyTutorPage() {
  const { user, isLoading } = useAuthStore();

  // Remote profile state
  const [profile, setProfile] = useState<BeTutorDetail | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Reference data (cần giữ nguyên object để lookup ID)
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [academicLevelOptions, setAcademicLevelOptions] = useState<AcademicLevel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  // Form fields — Personal info (PUT /api/users/profile)
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [detail, setDetail] = useState("");
  const [dob, setDob] = useState("");

  // Form fields — Tutor profile (PUT /api/tutors/tutor/profile)
  // selectedSubjectNames: tên để hiển thị badge; subjectIds: numeric IDs để submit
  const [selectedSubjectNames, setSelectedSubjectNames] = useState<string[]>([]);
  const [academicLevelName, setAcademicLevelName] = useState(""); // tên để hiển thị
  const [major, setMajor] = useState("");
  const [education, setEducation] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number>(150000);

  // Certificate management
  const [existingCerts, setExistingCerts] = useState<string[]>([]);
  const [newCertFiles, setNewCertFiles] = useState<File[]>([]);
  const certFileRef = useRef<HTMLInputElement>(null);
  // Chỉ số chứng chỉ đang xem trong modal (null = đóng)
  const [certIndex, setCertIndex] = useState<number | null>(null);

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deletingCert, setDeletingCert] = useState<string | null>(null);

  // ── Load reference data ─────────────────────────────────────────────────────
  useEffect(() => {
    void Promise.all([
      getSubjects(),
      getAcademicLevels(),
      getCities(),
    ]).then(([s, a, c]) => {
      setSubjectOptions(s);
      setAcademicLevelOptions(a);
      setCities(c);
    });
  }, []);

  // ── Load districts khi chọn tỉnh/thành ─────────────────────────────────────
  useEffect(() => {
    if (!city) { setDistricts([]); return; }
    void getDistricts(city).then(setDistricts);
  }, [city]);

  // ── Load my profile ─────────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    const data = await getMyTutorProfile();
    setProfile(data);
    if (data) {
      // Personal info (đến từ user profile, trả về qua TutorDetailResponse)
      setFullName(data.fullName ?? "");
      setPhoneNumber(data.phoneNumber ?? "");
      setGender(data.gender ?? "");
      setCity(data.city ?? "");
      setDistrict(data.district ?? "");
      setDetail(data.detail ?? "");
      setDob(data.dob?.slice(0, 10) ?? "");
      // Tutor profile
      setAcademicLevelName(data.academicLevel ?? "");
      setMajor(data.major ?? "");
      setEducation(data.education ?? "");
      setExperience(data.experience != null ? String(data.experience) : "");
      setDescription(data.description ?? "");
      setHourlyRate(data.hourlyRate ?? 150000);
      // Subjects: BE trả về array tên — dùng trực tiếp làm display names
      setSelectedSubjectNames(data.subjects ?? []);
      setExistingCerts(data.certificateUrls ?? []);
    }
    setLoadingProfile(false);
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadProfile();
  }, [isLoading, user, loadProfile]);

  // ── Toggle subject selection ────────────────────────────────────────────────
  const toggleSubject = (name: string) => {
    setSelectedSubjectNames((prev) =>
      prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name],
    );
  };

  // ── Delete certificate ──────────────────────────────────────────────────────
  const handleDeleteCert = async (url: string) => {
    if (!confirm("Bạn có chắc muốn xóa chứng chỉ này không?")) return;
    setDeletingCert(url);
    const res = await removeTutorCertificate(url);
    setDeletingCert(null);
    if (res.ok) {
      await loadProfile();
    } else {
      setError(res.error ?? "Không thể xóa chứng chỉ");
    }
  };

  // ── Submit — gọi 2 API riêng biệt theo đúng Swagger schema ─────────────────
  const handleSubmit = async () => {
    setError("");
    setSaving(true);

    // 1. Cập nhật thông tin cá nhân (PUT /api/users/profile)
    const userRes = await updateUserProfile({
      fullName: fullName || undefined,
      phoneNumber: phoneNumber || undefined,
      gender: gender || undefined,
      city: city || undefined,
      district: district || undefined,
      detail: detail || undefined,
      dob: dob || undefined,
    });

    if (!userRes.ok) {
      setSaving(false);
      setError(`Lỗi cập nhật thông tin cá nhân: ${userRes.error}`);
      return;
    }

    // 2. Cập nhật hồ sơ tutor (PUT /api/tutors/tutor/profile)
    // Cần map tên → numeric ID cho academicLevel và subjects
    const academicLevelId = findAcademicLevelId(academicLevelOptions, academicLevelName);
    const subjectIds = findSubjectIds(subjectOptions, selectedSubjectNames);
    const expNum = experience === "" ? undefined : Number(experience);

    const tutorRes = await updateTutorProfile("", {
      bio: description || undefined,
      pricePerHour: hourlyRate,
      experience: expNum != null && !isNaN(expNum) ? String(expNum) : "",
      education: education || undefined,
      major: major || undefined,
      academicLevelId,
      subjectIds: subjectIds.length > 0 ? subjectIds : undefined,
      certificateFiles: newCertFiles,
    });

    setSaving(false);

    if (tutorRes.ok) {
      setSaved(true);
      setNewCertFiles([]);
      if (certFileRef.current) certFileRef.current.value = "";
      setTimeout(() => setSaved(false), 4000);
      await loadProfile();
    } else {
      setError(tutorRes.error ?? "Gửi hồ sơ thất bại");
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading || loadingProfile) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl space-y-4">
            <Skeleton className="h-8 w-64 rounded" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </section>
      </main>
    );
  }

  const verStatus = profile?.verificationStatus ?? "NOT_VERIFIED";
  const statusMeta = STATUS_MAP[verStatus] ?? STATUS_MAP.NOT_VERIFIED;
  const StatusIcon = statusMeta.icon;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-5">

          {/* Header */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Đăng ký làm gia sư</h1>
              <p className="text-sm text-muted-foreground">
                Hoàn thành hồ sơ và gửi để admin xét duyệt
              </p>
            </div>
          </div>

          {/* Trạng thái xác minh */}
          <div className={`flex items-start gap-3 rounded-xl border p-4 ${statusMeta.color}`}>
            <StatusIcon className="h-5 w-5 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="font-semibold text-sm">{statusMeta.label}</p>
              {verStatus === "REJECTED" && profile?.rejectionReason && (
                <p className="mt-1 text-sm opacity-80">
                  <span className="font-medium">Lý do: </span>
                  {profile.rejectionReason}
                </p>
              )}
            </div>
          </div>

          {/* Saved notification */}
          {saved && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Đã gửi/cập nhật hồ sơ đăng ký làm gia sư
            </div>
          )}

          {/* ── Thông tin cá nhân (PUT /api/users/profile) ────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Họ và tên</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> Số điện thoại
                  </label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0901234567"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Ngày sinh</label>
                  <Input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Tỉnh / Thành phố
                  </label>
                  <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setDistrict(""); }}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">-- Chọn tỉnh/thành --</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Quận / Huyện</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!city || districts.length === 0}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="">-- Chọn quận/huyện --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Địa chỉ chi tiết</label>
                <Input
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Học vấn & Kinh nghiệm (PUT /api/tutors/tutor/profile) ─────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" />
                Học vấn & Kinh nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cấp học / Trình độ</label>
                  <select
                    value={academicLevelName}
                    onChange={(e) => setAcademicLevelName(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">-- Chọn trình độ --</option>
                    {academicLevelOptions.map((a) => (
                      <option key={a.id} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Chuyên ngành</label>
                  <Input
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Sư phạm Toán, Vật lý..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Trình độ học vấn</label>
                <Input
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  placeholder="Cử nhân / Thạc sĩ / Tiến sĩ..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Số năm kinh nghiệm</label>
                <Input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="3"
                  min={0}
                />
                <p className="text-xs text-muted-foreground">Nhập số năm kinh nghiệm giảng dạy</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Giới thiệu bản thân
                  <span className="text-muted-foreground font-normal ml-1">({description.length}/500)</span>
                </label>
                <textarea
                  className="w-full min-h-28 rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  placeholder="Chia sẻ về phong cách dạy học, phương pháp giảng dạy và kinh nghiệm của bạn..."
                />
              </div>
            </CardContent>
          </Card>

          {/* ── Môn dạy & Học phí (PUT /api/tutors/tutor/profile) ─────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Môn dạy & Học phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Môn dạy</label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((s) => (
                    <Badge
                      key={s.id}
                      variant={selectedSubjectNames.includes(s.name) ? "default" : "outline"}
                      className="cursor-pointer select-none text-sm px-3 py-1"
                      onClick={() => toggleSubject(s.name)}
                    >
                      {s.name}
                    </Badge>
                  ))}
                </div>
                {selectedSubjectNames.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Đã chọn: {selectedSubjectNames.join(", ")}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Học phí / giờ (VNĐ)</label>
                <Input
                  type="number"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  min={50000}
                  step={10000}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Hiển thị:{" "}
                  <span className="font-semibold text-primary">
                    {hourlyRate.toLocaleString("vi-VN")} VNĐ/giờ
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* ── Chứng chỉ ─────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-primary" />
                Chứng chỉ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing certs */}
              {existingCerts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Chứng chỉ hiện có:</p>
                  {existingCerts.map((url, i) => (
                    <div
                      key={url}
                      className="flex items-center gap-2 rounded-lg border border-border p-2.5 bg-muted/30"
                    >
                      <Award className="h-4 w-4 text-primary shrink-0" />
                      <button
                        type="button"
                        onClick={() => setCertIndex(i)}
                        className="flex-1 truncate text-left text-sm text-primary hover:underline"
                      >
                        {certificateFileName(url)}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteCert(url)}
                        disabled={deletingCert === url}
                        className="ml-2 p-1 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-50"
                        title="Xóa chứng chỉ"
                      >
                        {deletingCert === url ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload new certs */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload chứng chỉ mới:</p>
                <div
                  className="rounded-lg border-2 border-dashed border-border p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => certFileRef.current?.click()}
                >
                  <Upload className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-sm text-muted-foreground">
                    Bấm để chọn file chứng chỉ (PDF, JPG, PNG)
                  </p>
                </div>
                <input
                  ref={certFileRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  title="Chọn file chứng chỉ"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    setNewCertFiles((prev) => [...prev, ...files]);
                  }}
                />
                {newCertFiles.length > 0 && (
                  <div className="space-y-1.5">
                    {newCertFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Award className="h-3.5 w-3.5 text-primary" />
                        <span className="flex-1 truncate">{f.name}</span>
                        <button
                          type="button"
                          className="text-destructive hover:bg-destructive/10 rounded p-0.5"
                          onClick={() =>
                            setNewCertFiles((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Error & Submit ─────────────────────────────────────────────────── */}
          <div className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <Button
              onClick={() => void handleSubmit()}
              loading={saving}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="h-4 w-4" />
              {verStatus === "APPROVED"
                ? "Cập nhật hồ sơ gia sư"
                : verStatus === "PENDING"
                ? "Cập nhật hồ sơ đang chờ duyệt"
                : "Gửi hồ sơ đăng ký"}
            </Button>
          </div>

        </div>
      </section>

      <CertificateViewer
        urls={existingCerts}
        index={certIndex}
        onIndexChange={setCertIndex}
        onClose={() => setCertIndex(null)}
      />
    </main>
  );
}
