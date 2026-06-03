import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tìm gia sư uy tín – Lọc theo môn học, khu vực & học phí",
  description:
    "Danh sách gia sư đã được xác minh trên LIFLOW. Lọc theo môn học, quận/huyện và " +
    "mức học phí để tìm gia sư phù hợp, xem đánh giá và đặt lịch học ngay.",
  alternates: { canonical: "/tutors" },
  openGraph: {
    title: "Tìm gia sư uy tín trên LIFLOW",
    description:
      "Lọc gia sư theo môn học, khu vực và học phí. Xem hồ sơ, đánh giá và đặt lịch học.",
    url: "/tutors",
    type: "website",
  },
};

export default function TutorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
