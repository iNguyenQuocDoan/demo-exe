import { apiClient } from "@/lib/apiClient";
import type { City, District, FeeConfig, Subject, TutorProfile, User } from "@/types";

let citiesCache: City[] | null = null;
let districtsCache: District[] | null = null;
let subjectsCache: Subject[] | null = null;
let feeConfigCache: FeeConfig | null = null;

const userNameCache = new Map<string, string>();
const tutorNameCache = new Map<string, string>();

export interface UserContact {
  name: string;
  phone?: string;
  address?: string;
}
const userContactCache = new Map<string, UserContact>();

const DEFAULT_FEE_CONFIG: FeeConfig = {
  feeType: "PERCENT",
  feeValue: 10,
  whoPays: "PARENT",
  appliesToTrial: false,
};

export async function getCities(force = false): Promise<City[]> {
  if (!force && citiesCache) return citiesCache;
  const { data } = await apiClient.get<{ ok: boolean; data: City[] }>("/reference/cities");
  citiesCache = data.data;
  return citiesCache;
}

export async function getDistricts(cityId?: string, force = false): Promise<District[]> {
  if (!force && districtsCache && !cityId) return districtsCache;
  const params = cityId ? { cityId } : {};
  const { data } = await apiClient.get<{ ok: boolean; data: District[] }>("/reference/districts", { params });
  if (!cityId) districtsCache = data.data;
  return data.data;
}

export async function getSubjects(force = false): Promise<Subject[]> {
  if (!force && subjectsCache) return subjectsCache;
  const { data } = await apiClient.get<{ ok: boolean; data: Subject[] }>("/reference/subjects");
  subjectsCache = data.data;
  return subjectsCache;
}

export async function getFeeConfig(force = false): Promise<FeeConfig> {
  if (!force && feeConfigCache) return feeConfigCache;
  try {
    const { data } = await apiClient.get<{ ok: boolean; data: FeeConfig }>("/reference/fee-config");
    feeConfigCache = data.data;
    return feeConfigCache;
  } catch {
    return DEFAULT_FEE_CONFIG;
  }
}

export async function updateFeeConfig(
  config: FeeConfig
): Promise<{ ok: boolean; data?: FeeConfig; error?: string }> {
  try {
    const { data } = await apiClient.put<{ ok: boolean; data: FeeConfig }>(
      "/reference/fee-config",
      config
    );
    feeConfigCache = data.data;
    return { ok: true, data: data.data };
  } catch (err: unknown) {
    const msg =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      "Khong the cap nhat fee config";
    return { ok: false, error: msg };
  }
}

export async function getSubjectMap(force = false): Promise<Record<string, string>> {
  const subjects = await getSubjects(force);
  return Object.fromEntries(subjects.map((s) => [s.id, s.name]));
}

export async function getDistrictMap(force = false): Promise<Record<string, string>> {
  const districts = await getDistricts(undefined, force);
  return Object.fromEntries(districts.map((d) => [d.id, d.name]));
}

export async function getUserNameMap(userIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const missingIds = uniqueIds.filter((id) => !userNameCache.has(id));

  if (missingIds.length > 0) {
    const users = await Promise.all(
      missingIds.map((id) =>
        apiClient
          .get<{ ok: boolean; user: User }>(`/users/${id}`)
          .then((r) => r.data.user)
          .catch(() => null)
      )
    );
    users.forEach((user, i) => {
      userNameCache.set(missingIds[i], user?.fullName ?? missingIds[i]);
    });
  }

  return Object.fromEntries(uniqueIds.map((id) => [id, userNameCache.get(id) ?? id]));
}

export async function getUserContactMap(userIds: string[]): Promise<Record<string, UserContact>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const missingIds = uniqueIds.filter((id) => !userContactCache.has(id));

  if (missingIds.length > 0) {
    const users = await Promise.all(
      missingIds.map((id) =>
        apiClient
          .get<{ ok: boolean; user: User }>(`/users/${id}`)
          .then((r) => r.data.user)
          .catch(() => null)
      )
    );
    users.forEach((user, i) => {
      userContactCache.set(missingIds[i], {
        name: user?.fullName ?? missingIds[i],
        phone: user?.phone,
        address: user?.address,
      });
    });
  }

  return Object.fromEntries(uniqueIds.map((id) => [id, userContactCache.get(id) ?? { name: id }]));
}

export async function getTutorNameMap(tutorIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(tutorIds.filter(Boolean)));
  const missingIds = uniqueIds.filter((id) => !tutorNameCache.has(id));

  if (missingIds.length > 0) {
    const tutors = await Promise.all(
      missingIds.map((id) =>
        apiClient
          .get<{ ok: boolean; tutor: TutorProfile }>(`/tutors/${id}`)
          .then((r) => r.data.tutor)
          .catch(() => null)
      )
    );
    tutors.forEach((tutor, i) => {
      tutorNameCache.set(missingIds[i], tutor?.fullName ?? missingIds[i]);
    });
  }

  return Object.fromEntries(uniqueIds.map((id) => [id, tutorNameCache.get(id) ?? id]));
}
