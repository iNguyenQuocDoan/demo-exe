import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return formatVietnamDate(dateStr);
}

export function parseBeDate(value?: string | Date | null): Date {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  
  const dateStr = value.trim();
  // Kiểm tra xem chuỗi có chỉ thị múi giờ (Z hoặc + hoặc - sau T) chưa
  const hasTimezone = dateStr.includes("Z") || 
                      (dateStr.includes("T") && (dateStr.split("T")[1].includes("+") || dateStr.split("T")[1].includes("-")));
  
  if (!hasTimezone) {
    // Nếu không có timezone, mặc định coi đây là giờ UTC và thêm Z
    return new Date(dateStr + "Z");
  }
  
  return new Date(dateStr);
}

export function formatVietnamDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatVietnamTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatVietnamDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatVietnamWeekdayDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatVietnamShortDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatVietnamDayMonth(value?: string | Date | null): string {
  if (!value) return "—";
  const date = parseBeDate(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export function randomDelay(): Promise<void> {
  return sleep(200 + Math.random() * 200);
}

