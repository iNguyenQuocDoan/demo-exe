"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-primary/10 bg-card p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border bg-muted/35 px-5 py-5">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
          </div>
          <SheetTitle className="text-xl">{title}</SheetTitle>
          <SheetDescription className="leading-relaxed">{description}</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-5">{children}</div>

        <SheetFooter className="sticky bottom-0 gap-2 border-t border-border bg-card/96 px-5 py-4 backdrop-blur sm:gap-2">
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Xóa bộ lọc
          </Button>
          <Button onClick={onApply}>Áp dụng</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
