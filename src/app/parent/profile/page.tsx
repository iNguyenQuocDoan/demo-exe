"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, User, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangePasswordCard } from "@/components/shared/ChangePasswordCard";
import { useAuthStore } from "@/store/useAuthStore";
import { updateSelf } from "@/api/usersApi";

export default function ParentProfilePage() {
  const { user, isLoading, login } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    setFullName(user.fullName ?? "");
    setPhone(user.phone ?? "");
    setAddress(user.address ?? "");
  }, [isLoading, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateSelf(user?.id ?? "", { fullName: fullName.trim(), phone: phone.trim(), address: address.trim() });
      login(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background py-8 px-4">
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-8 bg-muted rounded w-40 animate-pulse" />
          <div className="h-48 bg-muted rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-lg space-y-6">

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/parent"><ArrowLeft className="h-4 w-4 mr-1" /> Quay lại</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Thông tin cá nhân</h1>
            <p className="text-sm text-muted-foreground">Cập nhật thông tin liên lạc để gia sư biết cách kết nối</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" /> Thông tin cơ bản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Số điện thoại
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground">
                Số điện thoại sẽ được hiển thị cho gia sư khi buổi học được xác nhận.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Địa chỉ
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <p className="text-xs text-muted-foreground">
                Địa chỉ học sẽ được hiển thị cho gia sư khi hình thức là dạy trực tiếp.
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button onClick={handleSave} loading={saving} disabled={saving} className="w-full gap-2">
              {saved
                ? <><CheckCircle2 className="h-4 w-4" /> Đã lưu</>
                : <><Save className="h-4 w-4" /> Lưu thay đổi</>
              }
            </Button>
          </CardContent>
        </Card>

        <ChangePasswordCard />

      </div>
    </main>
  );
}
