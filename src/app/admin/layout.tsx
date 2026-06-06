import { AdminRoute } from "@/components/layout/RouteGuards";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main data-scroll-root className="flex flex-1 flex-col overflow-auto lg:ml-60">
          <DashboardTopbar />
          {children}
        </main>
      </div>
    </AdminRoute>
  );
}
