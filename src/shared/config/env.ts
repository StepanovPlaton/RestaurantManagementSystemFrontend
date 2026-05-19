function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export const env = {
  apiUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  ),
  mediaUrl: trimTrailingSlash(
    process.env.NEXT_PUBLIC_MEDIA_URL ?? "/uploads",
  ),
} as const;
