"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpDown, BookOpen, MapPin, Monitor, RotateCcw } from "lucide-react";
import { getCities, getDistricts, getSubjects } from "@/api/referenceApi";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/store/useFilterStore";
import type { City, District, Subject } from "@/types";

export function TutorFilter({ compact = false }: { compact?: boolean }) {
  const { filter, setFilter, resetFilter } = useFilterStore();
  const [cities, setCities] = useState<City[]>([]);
  const [allDistricts, setAllDistricts] = useState<District[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    let active = true;
    void Promise.all([getCities(), getDistricts(), getSubjects()]).then(
      ([citiesData, districtsData, subjectsData]) => {
        if (!active) return;
        setCities(citiesData);
        setAllDistricts(districtsData);
        setSubjects(subjectsData);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const districts = useMemo(
    () =>
      filter.cityId
        ? allDistricts.filter((district) => district.cityId === filter.cityId)
        : allDistricts,
    [allDistricts, filter.cityId],
  );

  const hasReferenceData = useMemo(
    () => cities.length > 0 || subjects.length > 0,
    [cities.length, subjects.length],
  );

  const wrapperClass = compact
    ? "space-y-4"
    : "surface-card p-5 sm:p-6";

  return (
    <div className={wrapperClass}>
      {!compact ? (
        <div className="mb-5">
          <h3 className="text-base font-semibold text-foreground">Bộ lọc tìm kiếm</h3>
          <p className="mt-1 text-sm text-muted-foreground">Tinh chỉnh để tìm gia sư phù hợp hơn với nhu cầu của con.</p>
        </div>
      ) : null}

      {!hasReferenceData && (
        <p className="rounded-xl border border-amber-300/30 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Chưa có dữ liệu tham chiếu từ Firebase. Hãy chạy script seed nếu cần.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <FilterField icon={MapPin} label="Thành phố">
          <Select
            value={filter.cityId || "__all__"}
            onValueChange={(value) =>
              setFilter({ cityId: value === "__all__" ? "" : value, districtId: "" })
            }
          >
            <SelectTrigger className="h-12 bg-card">
              <SelectValue placeholder="Chọn thành phố" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả thành phố</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField icon={MapPin} label="Quận / Huyện">
          <Select
            value={filter.districtId || "__all__"}
            onValueChange={(value) =>
              setFilter({ districtId: value === "__all__" ? "" : value })
            }
          >
            <SelectTrigger className="h-12 bg-card">
              <SelectValue placeholder="Tất cả quận" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả quận</SelectItem>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField icon={BookOpen} label="Môn học">
          <Select
            value={filter.subjectId || "__all__"}
            onValueChange={(value) =>
              setFilter({ subjectId: value === "__all__" ? "" : value })
            }
          >
            <SelectTrigger className="h-12 bg-card">
              <SelectValue placeholder="Tất cả môn" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tất cả môn</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField icon={Monitor} label="Hình thức học">
          <Select
            value={filter.teachingMode}
            onValueChange={(value) =>
              setFilter({ teachingMode: value as typeof filter.teachingMode })
            }
          >
            <SelectTrigger className="h-12 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả hình thức</SelectItem>
              <SelectItem value="OFFLINE">Học trực tiếp</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField icon={ArrowUpDown} label="Sắp xếp" className="sm:col-span-2">
          <Select
            value={filter.sortBy}
            onValueChange={(value) =>
              setFilter({ sortBy: value as typeof filter.sortBy })
            }
          >
            <SelectTrigger className="h-12 bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              <SelectItem value="reviewCount">Nhiều đánh giá</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilter}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          aria-label="Xóa toàn bộ bộ lọc"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Xóa bộ lọc
        </Button>
      </div>
    </div>
  );
}

function FilterField({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </label>
      {children}
    </div>
  );
}
