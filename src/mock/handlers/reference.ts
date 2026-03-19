import { db } from "../db";
import type { FeeConfig } from "@/types";

export function handleGetCities() {
  return { status: 200, data: { ok: true, data: db.cities } };
}

export function handleGetDistricts(params: Record<string, string>) {
  const districts = params.cityId
    ? db.districts.filter((d) => d.cityId === params.cityId)
    : db.districts;
  return { status: 200, data: { ok: true, data: districts } };
}

export function handleGetSubjects() {
  return { status: 200, data: { ok: true, data: db.subjects } };
}

export function handleGetFeeConfig() {
  return { status: 200, data: { ok: true, data: db.feeConfig } };
}

export function handleUpdateFeeConfig(body: Partial<FeeConfig>) {
  db.feeConfig = { ...db.feeConfig, ...body };
  return { status: 200, data: { ok: true, data: db.feeConfig } };
}
