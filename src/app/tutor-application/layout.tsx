import type { Metadata } from "next";

// Form đăng ký + dữ liệu cá nhân → không cho lập chỉ mục.
export const metadata: Metadata = {
  title: "Hồ sơ ứng tuyển gia sư",
  robots: { index: false, follow: false },
};

export default function TutorApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
