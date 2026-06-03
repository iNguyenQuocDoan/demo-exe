import type { Metadata } from "next";

// Trang đăng nhập/đăng ký không mang giá trị SEO → noindex (vẫn follow link).
export const metadata: Metadata = {
  title: "Đăng nhập",
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
