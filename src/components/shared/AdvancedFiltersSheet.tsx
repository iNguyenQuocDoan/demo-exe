"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AdvancedFiltersSheet({
  title = "Bộ lọc nâng cao",
  description = "Điều chỉnh bộ lọc và áp dụng để cập nhật kết quả.",
  triggerLabel = "Bộ lọc",
  open,
  onOpenChange,
  children,
  onApply,
  onReset,
}: {
  title?: string;
  description?: string;
  triggerLabel?: string;
  /** Controlled mode: provide both open + onOpenChange to hide the built-in trigger */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
}) {
  const controlled = open !== undefined && onOpenChange !== undefined;

  return (
    <Sheet open={controlled ? open : undefined} onOpenChange={controlled ? onOpenChange : undefined}>
      {!controlled && (
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="h-10 gap-1.5">
            <SlidersHorizontal className="h-4 w-4" />
            {triggerLabel}
          </Button>
        </SheetTrigger>
      )}
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-4">{children}</div>

        <SheetFooter className="mt-6 gap-2 sm:gap-2">
          <Button variant="outline" onClick={onReset}>
            Xóa bộ lọc
          </Button>
          <Button onClick={onApply}>Áp dụng</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
