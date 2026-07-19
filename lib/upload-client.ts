import type { MediaItem } from "@/types/media";
import type { UploadMediaType, UploadMode } from "@/types/upload";

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|heic|heif|bmp|svg)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|ogg|m4v|avi|mkv)$/i;

const BATCH_SIZE = 12;

export interface UploadBatchMeta {
  folderGroupId?: string;
  folderName?: string;
}

export function filterFilesForUpload(
  files: File[],
  mediaType: UploadMediaType
): File[] {
  return files.filter((file) => {
    const name = file.name;
    if (!name || name.startsWith(".") || name === ".DS_Store") return false;

    const mime = file.type.toLowerCase();
    const isImage = mime.startsWith("image/") || IMAGE_EXT.test(name);
    const isVideo = mime.startsWith("video/") || VIDEO_EXT.test(name);

    if (mediaType === "image") return isImage;
    if (mediaType === "video") return isVideo;
    return isImage || isVideo;
  });
}

export function createFolderGroupId(): string {
  return `folder_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function extractFolderName(files: File[]): string {
  const withPath = files.find((f) => f.webkitRelativePath);
  if (withPath?.webkitRelativePath) {
    return withPath.webkitRelativePath.split("/")[0] ?? "Uploaded folder";
  }
  return "Uploaded folder";
}

export async function uploadFilesInBatches(
  files: File[],
  onProgress: (percent: number, uploaded: number, total: number) => void,
  meta?: UploadBatchMeta
): Promise<MediaItem[]> {
  const results: MediaItem[] = [];
  const total = files.length;

  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const formData = new FormData();
    batch.forEach((file) => formData.append("files", file));
    if (meta?.folderGroupId) {
      formData.append("folderGroupId", meta.folderGroupId);
    }
    if (meta?.folderName) {
      formData.append("folderName", meta.folderName);
    }

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        (err as { error?: string }).error ?? `Upload failed (${res.status})`
      );
    }

    const data = (await res.json()) as { items: MediaItem[] };
    results.push(...data.items);

    const uploaded = Math.min(i + batch.length, total);
    onProgress(Math.round((uploaded / total) * 100), uploaded, total);
  }

  return results;
}

export function uploadModeLabel(
  mode: UploadMode,
  mediaType: UploadMediaType
): string {
  const kind =
    mediaType === "video"
      ? "videos"
      : mediaType === "image"
        ? "photos"
        : "media";
  if (mode === "single")
    return `Single ${mediaType === "video" ? "video" : "photo"}`;
  if (mode === "folder") return `Folder of ${kind}`;
  return `Multiple ${kind}`;
}
