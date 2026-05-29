import type { MediaFilters, MediaItem } from "@/types/media";

export function filterMedia(
  items: MediaItem[],
  filters: MediaFilters
): MediaItem[] {
  let result = [...items];

  if (filters.query.trim()) {
    const q = filters.query.toLowerCase();
    result = result.filter((item) =>
      item.fileName.toLowerCase().includes(q)
    );
  }

  if (filters.type !== "all") {
    result = result.filter((item) => item.mediaType === filters.type);
  }

  result.sort((a, b) => {
    const da = new Date(a.uploadDate).getTime();
    const db = new Date(b.uploadDate).getTime();
    return filters.sort === "recent" ? db - da : da - db;
  });

  return result;
}
