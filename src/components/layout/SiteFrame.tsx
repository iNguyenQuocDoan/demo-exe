"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

const SIDEBAR_PREFIXES = [
  "/admin",
  "/dashboard/admin",
  "/dashboard/tutor",
  "/tutor",
];

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hasSidebar = SIDEBAR_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (hasSidebar) return <>{children}</>;

  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
