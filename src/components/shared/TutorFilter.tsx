"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
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

  return (
    <div className={compact ? "space-y-3" : "surface-card p-5 sm:p-6"}>
      {!compact ? (
        <h3 className="mb-4 text-sm font-semibold text-foreground">Bộ lọc tìm kiếm</h3>
      ) : null}

      {!hasReferenceData && (
        <p className="mb-3 text-xs text-muted-foreground">
          Chưa có dữ liệu tham chiếu từ Firebase. Hãy chạy script seed nếu cần.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Thành phố</label>
          <Select
            value={filter.cityId || "__all__"}
            onValueChange={(value) =>
              setFilter({ cityId: value === "__all__" ? "" : value, districtId: "" })
            }
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Quận / Huyện</label>
          <Select
            value={filter.districtId || "__all__"}
            onValueChange={(value) =>
              setFilter({ districtId: value === "__all__" ? "" : value })
            }
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Môn học</label>
          <Select
            value={filter.subjectId || "__all__"}
            onValueChange={(value) =>
              setFilter({ subjectId: value === "__all__" ? "" : value })
            }
          >
            <SelectTrigger>
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
        </div>

        <div className="space-y-1 sm:col-span-2">
          <label className="text-xs font-medium text-muted-foreground">Sắp xếp</label>
          <Select
            value={filter.sortBy}
            onValueChange={(value) =>
              setFilter({ sortBy: value as typeof filter.sortBy })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              <SelectItem value="price_asc">Giá thấp đến cao</SelectItem>
              <SelectItem value="price_desc">Giá cao đến thấp</SelectItem>
              <SelectItem value="reviewCount">Nhiều đánh giá</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
