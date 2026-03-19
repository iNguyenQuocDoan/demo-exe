import { ProtectedRoute } from "@/components/layout/RouteGuards";
import { TutorSidebar } from "@/components/tutor/TutorSidebar";

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
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
