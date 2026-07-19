import { encodeMediaPath } from "@/lib/utils";
import type { MediaItem, MediaType } from "@/types/media";
import type { Media } from "@prisma/client";

export function serializeMedia(record: Media): MediaItem {
  return {
    id: record.id,
    fileName: record.fileName,
    filePath: record.filePath,
    mediaType: record.mediaType as MediaType,
    uploadDate: record.uploadDate.toISOString(),
    fileSize: record.fileSize,
    thumbnailPath: record.thumbnailPath,
    folderGroupId: record.folderGroupId ?? null,
    folderName: record.folderName ?? null,
  };
}

export function groupMediaForGallery(items: MediaItem[]): {
  folderGroups: import("@/types/media").MediaFolderGroup[];
  singles: MediaItem[];
} {
  const folderMap = new Map<string, MediaItem[]>();
  const singles: MediaItem[] = [];

  for (const item of items) {
    if (item.folderGroupId) {
      const list = folderMap.get(item.folderGroupId) ?? [];
      list.push(item);
      folderMap.set(item.folderGroupId, list);
    } else {
      singles.push(item);
    }
  }

  const folderGroups = Array.from(folderMap.entries()).map(
    ([folderGroupId, groupItems]) => {
      const sorted = [...groupItems].sort(
        (a, b) =>
          new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      return {
        folderGroupId,
        folderName: sorted[0]?.folderName ?? "Uploaded folder",
        items: sorted,
        uploadDate: sorted[0]?.uploadDate ?? new Date().toISOString(),
      };
    }
  );

  folderGroups.sort(
    (a, b) =>
      new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  return { folderGroups, singles };
}

export function getDisplayUrl(item: MediaItem): string {
  return encodeMediaPath(item.thumbnailPath ?? item.filePath);
}

export function getBackgroundUrl(item: MediaItem): string {
  const path =
    item.mediaType === "image"
      ? item.filePath
      : item.thumbnailPath ?? item.filePath;
  return encodeMediaPath(path);
}

export function getFullSizeUrl(item: MediaItem): string {
  return encodeMediaPath(item.filePath);
}
