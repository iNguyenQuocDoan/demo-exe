"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";

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
    <form
      className="surface-card border-primary/12 bg-card/96 p-2.5 shadow-lg shadow-slate-950/8 backdrop-blur"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-primary" />
          <Input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm theo tên gia sư, môn học, khu vực..."
            className="h-12 border-transparent bg-muted/50 pl-11 pr-4 text-sm shadow-none transition-colors placeholder:text-muted-foreground/70 hover:bg-muted/70 focus-visible:bg-card focus-visible:ring-primary/35"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-12 justify-center gap-2 border-primary/20 px-4 text-sm hover:border-primary/35 hover:bg-primary/6"
            onClick={onOpenAdvanced}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
            {(activeCount ?? 0) > 0 ? (
              <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            ) : null}
          </Button>
          <Button type="submit" size="sm" className="h-12 px-5 text-sm shadow-sm shadow-primary/20">
            Tìm gia sư
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 px-1.5 pt-2.5 text-xs text-muted-foreground">
        {summary ? <span>{summary}</span> : null}
        {(activeCount ?? 0) > 0 ? (
          <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {activeCount} bộ lọc đang bật
          </Badge>
        ) : null}
      </div>
    </form>
  );
}
