"use client";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TimeFilter = "week" | "month" | "quarter" | "year" | "all";

interface DashboardFilterProps {
  selectedFilter: TimeFilter;
  onFilterChange: (filter: TimeFilter) => void;
}

const FILTERS: { value: TimeFilter; label: string }[] = [
  { value: "week", label: "7 ngày" },
  { value: "month", label: "Tháng này" },
  { value: "quarter", label: "Quý này" },
  { value: "year", label: "Năm này" },
  { value: "all", label: "Tất cả" },
];

export function DashboardFilter({
  selectedFilter,
  onFilterChange,
}: DashboardFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2">
      <div className="flex items-center gap-2 px-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Thời gian:</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value}
            variant={selectedFilter === filter.value ? "default" : "ghost"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="h-8 px-3 text-xs"
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function getDateRangeFromFilter(filter: TimeFilter): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
  );
  let start: Date;

  switch (filter) {
    case "week":
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "quarter":
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case "all":
    default:
      start = new Date(2020, 0, 1); // Far past date
      break;
  }

  return { start, end };
}
