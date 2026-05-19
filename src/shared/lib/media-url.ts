import { env } from "@/shared/config/env";

export function toMediaUrl(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized.startsWith("/uploads/")) {
    return `${env.mediaUrl}${normalized.slice("/uploads".length)}`;
  }

  if (normalized.startsWith("/")) {
    return `${env.mediaUrl}${normalized}`;
  }

  return `${env.mediaUrl}/${path}`;
}
