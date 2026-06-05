import { redirect } from "next/navigation";

/**
 * `/tutor` không có giao diện riêng — khu vực gia sư gồm các trang con
 * (/tutor/calendar, /tutor/analytics, /tutor/wallet, …) và trang tổng quan
 * nằm ở /dashboard/tutor. Truy cập thẳng /tutor sẽ điều hướng về tổng quan
 * thay vì trả 404.
 */
export default function TutorIndexPage() {
  redirect("/dashboard/tutor");
}
