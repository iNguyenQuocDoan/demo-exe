import { ProtectedRoute } from "@/components/layout/RouteGuards";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

export default function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowRoles={["tutor"]}>
      <div className="flex min-h-screen bg-background">
        <TutorSidebar />
        <main
          data-scroll-root
          className="flex flex-1 flex-col overflow-auto lg:ml-60"
        >
          <DashboardTopbar />
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
