"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal } from "lucide-react";

export function FilterBarCompact({
  searchValue,
  onSearchChange,
  summary,
  activeCount,
  onOpenAdvanced,
  onSubmit,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  summary?: string;
  activeCount?: number;
  onOpenAdvanced: () => void;
  onSubmit?: () => void;
}) {
  return (
    <div className="surface-card p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Tìm theo tên, môn học, khu vực..."
          className="h-10"
        />

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10 gap-1.5" onClick={onOpenAdvanced}>
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </Button>
          <Button size="sm" className="h-10" onClick={onSubmit}>
            Tìm / Lọc
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {summary ? <span>{summary}</span> : null}
        {(activeCount ?? 0) > 0 ? <Badge variant="secondary">{activeCount} bộ lọc đang bật</Badge> : null}
      </div>
    </div>
  );
}
