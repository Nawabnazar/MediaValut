const mediaCache = new Map<string, unknown>();

export function getCached<T>(key: string): T | undefined {
  return mediaCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  mediaCache.set(key, value);
}

export function invalidateCache(prefix?: string): void {
  if (!prefix) {
    mediaCache.clear();
    return;
  }
  for (const key of mediaCache.keys()) {
    if (key.startsWith(prefix)) mediaCache.delete(key);
  }
}

export const MEDIA_LIST_KEY = "media-list";
