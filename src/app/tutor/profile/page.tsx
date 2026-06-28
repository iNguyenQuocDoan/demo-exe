"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BookOpen, Camera, DollarSign, GraduationCap, MapPin, Save, User, X,
} from "lucide-react";
import { getCities, getDistricts, getSubjects } from "@/api/referenceApi";
import { getTutorById, updateTutorProfile } from "@/api/tutorApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordCard } from "@/components/shared/ChangePasswordCard";
import { useAuthStore } from "@/store/useAuthStore";
import type { City, District, Subject, TeachingMode, TutorProfile } from "@/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



function toggle<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function TutorProfilePage() {
  const { user, isLoading } = useAuthStore();
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form fields
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [pricePerHour, setPricePerHour] = useState(150000);
  const [teachingMode, setTeachingMode] = useState<string>("OFFLINE");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [cityId, setCityId] = useState("");
  const [districtIds, setDistrictIds] = useState<string[]>([]);
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [cityOptions, setCityOptions] = useState<City[]>([]);
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);



  useEffect(() => {
    let active = true;
    void Promise.all([getSubjects(), getCities()]).then(([subjectsData, citiesData]) => {
      if (!active) return;
      setSubjectOptions(subjectsData);
      setCityOptions(citiesData);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!cityId && cityOptions.length > 0) {
      setCityId(cityOptions[0].id);
    }
  }, [cityId, cityOptions]);

  useEffect(() => {
    if (isLoading || !user || !user.tutorProfileId) return;

    getTutorById(user.tutorProfileId).then((p) => {
      if (p) {
        setProfile(p);
        setBio(p.bio ?? "");
        setExperience(p.experience ?? "");
        setEducation(p.education ?? "");
        setPricePerHour(p.pricePerHour ?? 150000);
        // teachingMode is always OFFLINE
        setSubjects(p.subjects ?? []);
        setCityId(p.serviceAreas?.cityId ?? "");
        setDistrictIds(p.serviceAreas?.districtIds ?? []);
        setAvatarUrl(p.avatarUrl ?? "");
      }
      setLoading(false);
    });
  }, [isLoading, user]);

  useEffect(() => {
    if (!cityId) {
      setDistrictOptions([]);
      return;
    }

    let active = true;
    void getDistricts(cityId).then((districtsData) => {
      if (!active) return;
      setDistrictOptions(districtsData);
      const validIds = new Set(districtsData.map((district) => district.id));
      setDistrictIds((prev) => {
        return prev.filter((districtId) => validIds.has(districtId));
      });
    });

    return () => {
      active = false;
    };
  }, [cityId]);

  const handleAvatarUpload = async (file: File) => {
    setAvatarUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://liflow-be.onrender.com/api";
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      const res = await fetch(`${apiUrl}/uploads/image?folder=avatars`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      const data = await res.json() as { ok: boolean; url?: string; secure_url?: string };
      if (data.ok) {
        const url = data.url ?? data.secure_url ?? "";
        setAvatarUrl(url);
        // avatarUrl không thuộc UpdateTutorProfileRequest — không gọi updateTutorProfile
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarUrl("");
    // avatarUrl không thuộc UpdateTutorProfileRequest — không cần gọi API
  };

  const handleSave = async () => {
    if (!profile) return;
    setError("");
    setSaving(true);
    // Map subject string IDs → numeric IDs (BE yêu cầu int64 array)
    const numericSubjectIds = subjects
      .map((s) => Number(s))
      .filter((n) => !isNaN(n) && n > 0);
    const result = await updateTutorProfile(profile.id, {
      bio,
      experience,
      education,
      pricePerHour,
      subjectIds: numericSubjectIds,
    });
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      setError(result.error ?? "Lưu thất bại");
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl space-y-3">
            <div className="h-7 w-40 bg-muted animate-pulse rounded" />
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="h-4.5 w-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Hồ sơ gia sư</h1>
          </div>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="h-4 w-4 text-primary" />
                Ảnh đại diện
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative group shrink-0">
                  <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-border bg-muted">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Avatar"
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Đổi ảnh đại diện"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    title="Chọn ảnh đại diện"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleAvatarUpload(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ảnh JPG, PNG tối đa 10MB. Hover vào ảnh để thay đổi.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Đang tải..." : "Đổi ảnh"}
                    </Button>
                    {avatarUrl && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void handleRemoveAvatar()}
                        disabled={avatarUploading}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Trình độ học vấn</label>
                  <Input
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="Cử nhân Sư phạm / Đại học Bách Khoa..."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Kinh nghiệm giảng dạy</label>
                  <Input
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="3 years"
                  />
                  <p className="text-xs text-muted-foreground">Nhập dạng &quot;3 years&quot;, &quot;5 years&quot;…</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Giới thiệu bản thân
                  <span className="text-muted-foreground font-normal ml-1">({bio.length}/500)</span>
                </label>
                <textarea
                  className="w-full min-h-36 rounded-lg border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={500}
                  placeholder="Chia sẻ về phong cách dạy học, phương pháp giảng dạy và kinh nghiệm của bạn..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Teaching settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" />
                Môn dạy & Hình thức dạy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Môn dạy</label>
                <MultiSelect
                  options={subjectOptions.map((s) => ({ value: s.id, label: s.name }))}
                  selectedValues={subjects}
                  onChange={setSubjects}
                  placeholder="Chọn môn dạy"
                  searchPlaceholder="Tìm kiếm môn dạy..."
                  emptyMessage="Không tìm thấy môn dạy nào."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Hình thức dạy</label>
                <Select value={teachingMode} onValueChange={setTeachingMode}>
                  <SelectTrigger className="w-full sm:max-w-xs">
                    <SelectValue placeholder="Chọn hình thức dạy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Trực tiếp tại nhà học sinh</SelectItem>
                    <SelectItem value="AT_TUTOR_HOME">Tại nhà gia sư</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price & Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-primary" />
                Học phí & Khu vực
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Học phí / giờ (VNĐ)</label>
                <Input
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  min={50000}
                  step={10000}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Hiển thị:{" "}
                  <span className="font-semibold text-primary">
                    {pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
                  </span>
                </p>
              </div>

              <div className="space-y-4 border-t border-border pt-4">
                <label className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Khu vực dạy
                </label>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tỉnh / Thành phố</label>
                    <Select
                      value={cityId}
                      onValueChange={(val) => {
                        setCityId(val);
                        setDistrictIds([]);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn Tỉnh / Thành phố" />
                      </SelectTrigger>
                      <SelectContent>
                        {cityOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {cityId && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Quận / Huyện</label>
                      <MultiSelect
                        options={districtOptions.map((d) => ({
                          value: d.id,
                          label: d.name,
                        }))}
                        selectedValues={districtIds}
                        onChange={setDistrictIds}
                        placeholder="Chọn Quận / Huyện"
                        searchPlaceholder="Tìm kiếm Quận / Huyện..."
                        emptyMessage="Không tìm thấy Quận / Huyện nào."
                      />
                    </div>
                  )}
                </div>

                {districtIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Đã chọn {districtIds.length} khu vực
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Education icon for section header */}
          <div className="flex items-center gap-3">
            <GraduationCap className="h-4 w-4 text-muted-foreground hidden" />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            {saved && (
              <p className="text-sm text-success">Đã lưu thành công!</p>
            )}
            <Button onClick={handleSave} loading={saving} className="gap-2 ml-auto" size="lg">
              <Save className="h-4 w-4" />
              Lưu thay đổi
            </Button>
          </div>

          {/* Đổi mật khẩu */}
          <ChangePasswordCard />
        </div>
      </section>
    </main>
  );
}

