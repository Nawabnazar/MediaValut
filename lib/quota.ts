import {
  MAX_IMAGE_FILE_BYTES,
  MAX_IMAGE_STORAGE_BYTES,
  MAX_VIDEO_FILE_BYTES,
  MAX_VIDEO_STORAGE_BYTES,
} from "@/lib/config";
import { prisma } from "@/lib/db";
import type { MediaType } from "@/types/media";
import { formatFileSize } from "@/lib/utils";

export async function getUsedStorageBytes(
  mediaType: MediaType
): Promise<number> {
  const result = await prisma.media.aggregate({
    where: { mediaType },
    _sum: { fileSize: true },
  });
  return result._sum.fileSize ?? 0;
}

export async function assertUploadAllowed(
  mediaType: MediaType,
  fileSize: number,
  batchTotalSize = 0
): Promise<void> {
  if (mediaType === "image") {
    if (fileSize > MAX_IMAGE_FILE_BYTES) {
      throw new Error(
        `Image exceeds max file size (${formatFileSize(MAX_IMAGE_FILE_BYTES)})`
      );
    }
    const used = await getUsedStorageBytes("image");
    if (used + batchTotalSize + fileSize > MAX_IMAGE_STORAGE_BYTES) {
      throw new Error(
        `Image storage limit reached (${formatFileSize(MAX_IMAGE_STORAGE_BYTES)} max)`
      );
    }
    return;
  }

  if (fileSize > MAX_VIDEO_FILE_BYTES) {
    throw new Error(
      `Video exceeds max file size (${formatFileSize(MAX_VIDEO_FILE_BYTES)})`
    );
  }
  const used = await getUsedStorageBytes("video");
  if (used + batchTotalSize + fileSize > MAX_VIDEO_STORAGE_BYTES) {
    throw new Error(
      `Video storage limit reached (${formatFileSize(MAX_VIDEO_STORAGE_BYTES)} max)`
    );
  }
}
