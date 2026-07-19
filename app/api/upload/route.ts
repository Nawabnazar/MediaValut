import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeMedia } from "@/lib/media";
import { assertUploadAllowed } from "@/lib/quota";
import { saveMediaFile, saveTempFile, removeTempFile } from "@/lib/storage";
import {
  generateImageThumbnail,
  generateImageThumbnailFromBuffer,
  generateVideoThumbnail,
} from "@/lib/thumbnails";
import { uniqueFileName } from "@/lib/utils";
import type { MediaType } from "@/types/media";

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
]);

function resolveMediaType(mime: string, name: string): MediaType | null {
  if (IMAGE_TYPES.has(mime) || mime.startsWith("image/")) return "image";
  if (VIDEO_TYPES.has(mime) || mime.startsWith("video/")) return "video";
  if (/\.(jpe?g|png|gif|webp|avif|heic)$/i.test(name)) return "image";
  if (/\.(mp4|webm|mov|ogg|m4v|avi|mkv)$/i.test(name)) return "video";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const folderGroupId = (formData.get("folderGroupId") as string) || null;
    const folderName = (formData.get("folderName") as string) || null;

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const validFiles: { file: File; mediaType: MediaType }[] = [];
    for (const file of files) {
      const mediaType = resolveMediaType(file.type, file.name);
      if (mediaType) validFiles.push({ file, mediaType });
    }

    if (!validFiles.length) {
      return NextResponse.json(
        { error: "No valid image or video files" },
        { status: 400 }
      );
    }

    const imageBatchSize = validFiles
      .filter((f) => f.mediaType === "image")
      .reduce((s, f) => s + f.file.size, 0);
    const videoBatchSize = validFiles
      .filter((f) => f.mediaType === "video")
      .reduce((s, f) => s + f.file.size, 0);

    for (const { file, mediaType } of validFiles) {
      const batchExtra =
        mediaType === "image" ? imageBatchSize - file.size : videoBatchSize - file.size;
      await assertUploadAllowed(mediaType, file.size, batchExtra);
    }

    const results = [];

    for (const { file, mediaType } of validFiles) {
      const safeName = uniqueFileName(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());
      const bucket = mediaType === "image" ? "images" : "videos";

      const publicPath = await saveMediaFile(
        bucket,
        safeName,
        buffer,
        file.type || "application/octet-stream"
      );

      let thumbnailPath: string | null = null;
      try {
        if (mediaType === "image") {
          thumbnailPath = await generateImageThumbnailFromBuffer(buffer, safeName);
        } else {
          const tempPath = await saveTempFile(safeName, buffer);
          thumbnailPath = await generateVideoThumbnail(tempPath, safeName);
          await removeTempFile(tempPath);
        }
      } catch (thumbError) {
        console.warn("Thumbnail generation failed:", thumbError);
        thumbnailPath = mediaType === "image" ? publicPath : null;
      }

      const record = await prisma.media.create({
        data: {
          fileName: file.name,
          filePath: publicPath,
          mediaType,
          fileSize: file.size,
          thumbnailPath,
          folderGroupId,
          folderName,
        },
      });

      results.push(serializeMedia(record));
    }

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("POST /api/upload:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
