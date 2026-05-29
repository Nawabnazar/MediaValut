import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeMedia } from "@/lib/media";
import {
  generateImageThumbnail,
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
  "image/svg+xml",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
]);

function resolveMediaType(mime: string): MediaType | null {
  if (IMAGE_TYPES.has(mime) || mime.startsWith("image/")) return "image";
  if (VIDEO_TYPES.has(mime) || mime.startsWith("video/")) return "video";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      const mediaType = resolveMediaType(file.type);
      if (!mediaType) continue;

      const safeName = uniqueFileName(file.name);
      const uploadDir =
        mediaType === "image"
          ? "public/uploads/images"
          : "public/uploads/videos";

      await fs.mkdir(path.join(process.cwd(), uploadDir), { recursive: true });

      const diskPath = path.join(process.cwd(), uploadDir, safeName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(diskPath, buffer);

      const publicPath = `/uploads/${mediaType === "image" ? "images" : "videos"}/${safeName}`;

      let thumbnailPath: string | null = null;
      try {
        thumbnailPath =
          mediaType === "image"
            ? await generateImageThumbnail(diskPath, safeName)
            : await generateVideoThumbnail(diskPath, safeName);
      } catch (thumbError) {
        console.warn("Thumbnail generation failed:", thumbError);
        thumbnailPath =
          mediaType === "image" ? publicPath : null;
      }

      const record = await prisma.media.create({
        data: {
          fileName: file.name,
          filePath: publicPath,
          mediaType,
          fileSize: file.size,
          thumbnailPath,
        },
      });

      results.push(serializeMedia(record));
    }

    if (!results.length) {
      return NextResponse.json(
        { error: "No valid image or video files" },
        { status: 400 }
      );
    }

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("POST /api/upload:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
