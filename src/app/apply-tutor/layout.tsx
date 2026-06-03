import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trở thành gia sư – Đăng ký dạy học trên LIFLOW",
  description:
    "Đăng ký trở thành gia sư trên LIFLOW: tự chủ lịch dạy, tiếp cận hàng nghìn phụ huynh " +
    "và nhận thanh toán an toàn. Tạo hồ sơ và bắt đầu nhận lớp ngay hôm nay.",
  alternates: { canonical: "/apply-tutor" },
  openGraph: {
    title: "Trở thành gia sư trên LIFLOW",
    description:
      "Tự chủ lịch dạy, tiếp cận phụ huynh và nhận thanh toán an toàn. Đăng ký gia sư ngay.",
    url: "/apply-tutor",
    type: "website",
  },
};

export default function ApplyTutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
