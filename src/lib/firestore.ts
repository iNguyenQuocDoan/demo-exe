/**
 * Firestore collection references + generic helpers.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Collection names ─────────────────────────────────────────────────────────
export const COLLECTIONS = {
  cities: "cities",
  districts: "districts",
  subjects: "subjects",
  settings: "settings",
  users: "users",
  tutors: "tutors",
  tutorApplications: "tutorApplications",
  availability: "availability",
  bookings: "bookings",
  series: "series",
  lessons: "lessons",
  conversations: "conversations",
  reviews: "reviews",
  wallets: "wallets",
  transactions: "transactions",
  depositRequests: "depositRequests",
  withdrawRequests: "withdrawRequests",
  bookingHolds: "bookingHolds",
  rescheduleRequests: "rescheduleRequests",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export async function fsGet<T>(
  collName: string,
  id: string,
): Promise<T | null> {
  const snap = await getDoc(doc(db, collName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as T;
}

export async function fsQuery<T>(
  collName: string,
  constraints: QueryConstraint[],
  options?: {
    orderBy?: string;
    direction?: "asc" | "desc";
    limit?: number;
  },
): Promise<T[]> {
  const queryConstraints = [...constraints];

  if (options?.orderBy) {
    queryConstraints.push(orderBy(options.orderBy, options.direction || "asc"));
  }

  if (options?.limit) {
    queryConstraints.push(limit(options.limit));
  }

  const q = query(collection(db, collName), ...queryConstraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function fsSet<T extends object>(
  collName: string,
  id: string,
  data: T,
): Promise<void> {
  await setDoc(doc(db, collName, id), data);
}

export async function fsAdd<T extends object>(
  collName: string,
  data: T,
): Promise<string> {
  const ref = await addDoc(collection(db, collName), data);
  return ref.id;
}

export async function fsUpdate(
  collName: string,
  id: string,
  data: Partial<DocumentData>,
): Promise<void> {
  await updateDoc(doc(db, collName, id), data);
}

// Re-export Firebase helpers for use in API files
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
};
export { db };
