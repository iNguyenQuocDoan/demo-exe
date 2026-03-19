import { db } from "../db";
import type { TutorAvailability, WeeklySlot, AvailabilityException } from "@/types";

function uid(): string { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function handleGetAvailability(tutorId: string) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  return { status: 200, data: { ok: true, availability: avail ?? null } };
}

export function handleSaveAvailability(tutorId: string, body: Partial<TutorAvailability>) {
  const idx = db.availability.findIndex((a) => a.tutorId === tutorId);
  if (idx === -1) {
    const newAvail: TutorAvailability = {
      id: `av_${uid()}`, tutorId, weeklySlots: [], exceptions: [],
      defaultSessionDuration: 90, maxBookingsPerDay: 4, acceptingBookings: true,
      updatedAt: new Date().toISOString(), ...body,
    };
    db.availability.push(newAvail);
  } else {
    db.availability[idx] = { ...db.availability[idx], ...body, updatedAt: new Date().toISOString() };
  }
  return { status: 200, data: { ok: true } };
}

export function handleAddSlot(tutorId: string, body: Omit<WeeklySlot, "id">) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  const slot: WeeklySlot = { ...body, id: `slot_${uid()}`, isActive: true };
  avail.weeklySlots.push(slot);
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true, slot } };
}

export function handleUpdateSlot(tutorId: string, slotId: string, body: Partial<WeeklySlot>) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  const idx = avail.weeklySlots.findIndex((s) => s.id === slotId);
  if (idx === -1) return { status: 404, data: { ok: false, error: "Slot not found" } };
  avail.weeklySlots[idx] = { ...avail.weeklySlots[idx], ...body };
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true, slot: avail.weeklySlots[idx] } };
}

export function handleDeleteSlot(tutorId: string, slotId: string) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  avail.weeklySlots = avail.weeklySlots.filter((s) => s.id !== slotId);
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true } };
}

export function handleAddException(tutorId: string, body: Omit<AvailabilityException, "id">) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  const ex: AvailabilityException = { ...body, id: `ex_${uid()}` };
  avail.exceptions.push(ex);
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true, exception: ex } };
}

export function handleDeleteException(tutorId: string, exceptionId: string) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  avail.exceptions = avail.exceptions.filter((e) => e.id !== exceptionId);
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true } };
}

export function handleToggleAcceptingBookings(tutorId: string, body: { accepting?: boolean }) {
  const avail = db.availability.find((a) => a.tutorId === tutorId);
  if (!avail) return { status: 404, data: { ok: false, error: "Availability not found" } };
  avail.acceptingBookings = body.accepting ?? !avail.acceptingBookings;
  avail.updatedAt = new Date().toISOString();
  return { status: 200, data: { ok: true } };
}
