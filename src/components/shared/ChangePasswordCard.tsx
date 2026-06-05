"use client";

import { useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { changePassword } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Đổi mật khẩu — BE: POST /api/auth/change-password. Dùng ở trang hồ sơ parent & tutor. */
export function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setDone(false);
    if (!oldPassword || !newPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSaving(true);
    const res = await changePassword({ oldPassword, newPassword, confirmPassword });
    setSaving(false);
    if (res.ok) {
      setDone(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setDone(false), 3000);
    } else {
      setError(res.error ?? "Đổi mật khẩu thất bại.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <KeyRound className="h-4 w-4 text-primary" />
          Đổi mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mật khẩu hiện tại</label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••"
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Mật khẩu mới</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Xác nhận mật khẩu mới</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {done && <p className="text-sm text-success">Đã đổi mật khẩu thành công!</p>}
          <Button onClick={handleSubmit} loading={saving} className="gap-2 ml-auto">
            <Save className="h-4 w-4" />
            Cập nhật mật khẩu
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
