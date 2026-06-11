"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Checkbox } from "./checkbox";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  searchable?: boolean;
  loading?: boolean;
  className?: string;
}

export function MultiSelect({
  options,
  selectedValues,
  onChange,
  placeholder = "Chọn các mục...",
  searchPlaceholder = "Tìm kiếm...",
  emptyMessage = "Không tìm thấy kết quả.",
  searchable = true,
  loading = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const handleToggle = (value: string) => {
    const isSelected = selectedValues.includes(value);
    if (isSelected) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== value));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);

  // Lấy nhãn hiển thị cho các giá trị đã chọn
  const selectedLabels = React.useMemo(() => {
    return selectedValues
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean) as string[];
  }, [selectedValues, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn("relative w-full space-y-2", className)}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex min-h-11 w-full items-center justify-between rounded-xl border border-input bg-card px-3 py-2 text-sm text-left shadow-sm ring-offset-background transition-colors hover:border-primary/25 hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            )}
          >
            <div className="flex flex-wrap gap-1.5 items-center mr-2">
              {selectedValues.length === 0 ? (
                <span className="text-muted-foreground">{placeholder}</span>
              ) : (
                selectedValues.map((val) => {
                  const label = options.find((opt) => opt.value === val)?.label ?? val;
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs bg-primary/8 text-primary border border-primary/10 hover:bg-primary/12 font-medium"
                    >
                      {label}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleRemove(val, e)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleRemove(val, e as any);
                          }
                        }}
                        className="rounded-full hover:bg-destructive/10 hover:text-destructive p-0.5 transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  );
                })
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 text-muted-foreground/60 ml-auto">
              {selectedValues.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClearAll}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleClearAll(e as any);
                    }
                  }}
                  className="p-1 rounded-md hover:bg-muted hover:text-foreground cursor-pointer"
                  title="Xóa tất cả"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          className="p-0 w-[var(--radix-popover-trigger-width)] max-w-none min-w-[280px]"
          align="start"
        >
          {searchable && (
            <div className="flex items-center border-b px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="rounded-full p-0.5 hover:bg-muted text-muted-foreground/60 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {loading ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={cn(
                      "flex items-center space-x-2.5 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition-colors select-none",
                      isChecked
                        ? "bg-primary/5 text-primary font-medium"
                        : "hover:bg-muted/65 text-foreground"
                    )}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {}} // Đã xử lý ở onClick của container div
                      className="pointer-events-none"
                    />
                    <span className="flex-1 truncate">{option.label}</span>
                    {isChecked && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          {selectedValues.length > 0 && (
            <div className="border-t p-2 flex justify-between items-center text-xs text-muted-foreground bg-muted/20 rounded-b-xl">
              <span>Đã chọn {selectedValues.length} mục</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          )}
        </PopoverContent>
      </div>
    </Popover>
  );
}
