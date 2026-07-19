import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUploadTimestamp(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

export function encodeMediaPath(filePath: string): string {
  if (!filePath) return filePath;
  if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
    return filePath;
  }
  const [pathname, ...query] = filePath.split("?");
  const encoded =
    "/" +
    pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
  return query.length ? `${encoded}?${query.join("?")}` : encoded;
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function uniqueFileName(original: string): string {
  const ext = original.includes(".")
    ? sanitizeFileName(original.split(".").pop()!.toLowerCase())
    : "";
  const base = sanitizeFileName(original.replace(/\.[^/.]+$/, "")) || "media";
  const stamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  return ext ? `${base}_${stamp}_${random}.${ext}` : `${base}_${stamp}_${random}`;
}

