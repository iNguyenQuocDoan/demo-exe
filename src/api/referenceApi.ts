import { apiClient } from "@/lib/apiClient";
import { realApiClient } from "@/lib/realApiClient";
import type { City, District, FeeConfig, Subject, TutorProfile } from "@/types";

interface BeSubjectResponse {
  subjectId: number;
  name: string;
}
interface BeAcademicLevelResponse {
  academicLevelId: number;
  name: string;
}
interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

export interface AcademicLevel {
  id: string;
  name: string;
}
let academicLevelsCache: AcademicLevel[] | null = null;

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

// BE: GET /api/reference/provinces → raw [{ name, code, division_type, ... }]
interface BeProvince {
  name: string;
  code: number;
  division_type?: string;
  districts?: BeDistrict[];
}
interface BeDistrict {
  name: string;
  code: number;
  province_code?: number;
}

export async function getCities(force = false): Promise<City[]> {
  if (!force && citiesCache) return citiesCache;
  try {
    const { data } = await realApiClient.get<BeProvince[]>("/reference/provinces");
    citiesCache = (data ?? []).map((p) => ({ id: String(p.code), name: p.name }));
    return citiesCache;
  } catch {
    citiesCache = [];
    return citiesCache;
  }
}

// BE: GET /api/reference/districts?provinceCode= → raw 1 province kèm districts[]
// Cần cityId (provinceCode). Không có cityId → BE bắt buộc param nên trả [].
export async function getDistricts(cityId?: string, force = false): Promise<District[]> {
  if (!force && districtsCache && !cityId) return districtsCache;
  if (!cityId) {
    districtsCache = [];
    return [];
  }
  try {
    const { data } = await realApiClient.get<BeProvince>("/reference/districts", {
      params: { provinceCode: cityId },
    });
    return (data?.districts ?? []).map((d) => ({
      id: String(d.code),
      cityId,
      name: d.name,
    }));
  } catch {
    return [];
  }
}

// BE: GET /api/common/subjects → ApiResponse<List<SubjectResponse{subjectId, name}>>
export async function getSubjects(force = false): Promise<Subject[]> {
  if (!force && subjectsCache) return subjectsCache;
  try {
    const { data } = await realApiClient.get<BeApiResponse<BeSubjectResponse[]>>(
      "/common/subjects",
    );
    subjectsCache = (data.data ?? []).map((s) => ({
      id: String(s.subjectId),
      name: s.name,
      grades: [],
    }));
    return subjectsCache;
  } catch {
    return [];
  }
}

// BE: GET /api/common/academic-levels
export async function getAcademicLevels(force = false): Promise<AcademicLevel[]> {
  if (!force && academicLevelsCache) return academicLevelsCache;
  try {
    const { data } = await realApiClient.get<BeApiResponse<BeAcademicLevelResponse[]>>(
      "/common/academic-levels",
    );
    academicLevelsCache = (data.data ?? []).map((a) => ({
      id: String(a.academicLevelId),
      name: a.name,
    }));
    return academicLevelsCache;
  } catch {
    return [];
  }
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
  // BE chưa expose GET /users/{id} — chỉ trả về id làm tên cho an toàn
  uniqueIds.forEach((id) => {
    if (!userNameCache.has(id)) userNameCache.set(id, id);
  });
  return Object.fromEntries(uniqueIds.map((id) => [id, userNameCache.get(id) ?? id]));
}

export async function getUserContactMap(userIds: string[]): Promise<Record<string, UserContact>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  uniqueIds.forEach((id) => {
    if (!userContactCache.has(id)) userContactCache.set(id, { name: id });
  });
  return Object.fromEntries(uniqueIds.map((id) => [id, userContactCache.get(id) ?? { name: id }]));
}

export async function getTutorNameMap(tutorIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(tutorIds.filter(Boolean)));
  const missingIds = uniqueIds.filter((id) => !tutorNameCache.has(id));

  if (missingIds.length > 0) {
    const tutors = await Promise.all(
      missingIds.map((id) =>
        realApiClient
          .get<{ data?: TutorProfile }>(`/tutors/${id}/details`)
          .then((r) => r.data.data)
          .catch(() => null),
      ),
    );
    tutors.forEach((tutor, i) => {
      tutorNameCache.set(missingIds[i], tutor?.fullName ?? missingIds[i]);
    });
  }

  return Object.fromEntries(uniqueIds.map((id) => [id, tutorNameCache.get(id) ?? id]));
}
