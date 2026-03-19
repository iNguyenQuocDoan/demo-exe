"use client";
import { create } from "zustand";
import type { TutorFilter } from "@/types";

interface FilterState {
  filter: TutorFilter;
  setFilter: (partial: Partial<TutorFilter>) => void;
  resetFilter: () => void;
}

const DEFAULT_FILTER: TutorFilter = {
  cityId: "",
  districtId: "",
  teachingMode: "ALL",
  subjectId: "",
  minPrice: 0,
  maxPrice: 0,
  sortBy: "rating",
};

export const useFilterStore = create<FilterState>((set) => ({
  filter: DEFAULT_FILTER,
  setFilter: (partial) =>
    set((state) => ({ filter: { ...state.filter, ...partial } })),
  resetFilter: () => set({ filter: DEFAULT_FILTER }),
}));
