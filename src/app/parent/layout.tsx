import { ProtectedRoute } from "@/components/layout/RouteGuards";
import { FloatingChatWidget } from "@/components/chat/FloatingChatWidget";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowRoles={["parent"]}>
      {children}
      <FloatingChatWidget />
    </ProtectedRoute>
  );
}
