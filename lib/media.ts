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
  };
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
