import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("auth_role")?.value;

  if (!role) redirect("/auth/login?next=/dashboard");
  if (role === "admin") redirect("/dashboard/admin");
  if (role === "tutor") redirect("/dashboard/tutor");
  if (role === "parent") redirect("/dashboard/parent");
  if (role === "tutorCandidate") redirect("/dashboard/tutor-candidate");
  if (role === "guest") redirect("/dashboard/guest");

  redirect("/");
}
