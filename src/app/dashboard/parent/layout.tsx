import { ProtectedRoute } from "@/components/layout/RouteGuards";

export default function ParentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute allowRoles={["parent"]}>{children}</ProtectedRoute>;
}
