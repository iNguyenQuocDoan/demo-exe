import type { Metadata } from "next";
import "./globals.css";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { AuthProvider } from "@/components/layout/AuthProvider";
import { ScrollToTop } from "@/components/layout/ScrollToTop";

export const metadata: Metadata = {
  title: "LIFLOW – Kết nối Gia sư & Phụ huynh",
  description:
    "Nền tảng tìm và đặt lịch gia sư uy tín, lọc theo quận và quản lý lịch học định kỳ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <ScrollToTop />
          <SiteFrame>{children}</SiteFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
