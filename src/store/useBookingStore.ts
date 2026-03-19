"use client";
import { create } from "zustand";
import type { FreeSlot, BookingType } from "@/types";

export type BookingStep = "selectSlot" | "confirm" | "success";

interface BookingDraft {
  tutorId: string;
  type: BookingType;
  slot: FreeSlot | null;
  notes: string;
}

interface BookingState {
  draft: BookingDraft | null;
  step: BookingStep;
  isOpen: boolean;

  openBooking: (tutorId: string, type: BookingType) => void;
  setSlot: (slot: FreeSlot) => void;
  setNotes: (notes: string) => void;
  setStep: (step: BookingStep) => void;
  closeBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  draft: null,
  step: "selectSlot",
  isOpen: false,

  openBooking: (tutorId, type) =>
    set({ draft: { tutorId, type, slot: null, notes: "" }, step: "selectSlot", isOpen: true }),

  setSlot: (slot) =>
    set((s) => ({ draft: s.draft ? { ...s.draft, slot } : null, step: "confirm" })),

  setNotes: (notes) =>
    set((s) => ({ draft: s.draft ? { ...s.draft, notes } : null })),

  setStep: (step) => set({ step }),

  closeBooking: () => set({ isOpen: false, draft: null, step: "selectSlot" }),
}));
