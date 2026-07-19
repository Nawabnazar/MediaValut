import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { saveMediaFile } from "@/lib/storage";

const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 360;

export async function generateImageThumbnailFromBuffer(
  buffer: Buffer,
  fileName: string
): Promise<string> {
  const thumbName = `thumb_${path.parse(fileName).name}.webp`;
  const webp = await sharp(buffer)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: 82 })
    .toBuffer();

  return saveMediaFile("thumbnails", thumbName, webp, "image/webp");
}

export async function generateImageThumbnail(
  sourcePath: string,
  fileName: string
): Promise<string> {
  const buffer = await fs.readFile(sourcePath);
  return generateImageThumbnailFromBuffer(buffer, fileName);
}

export async function generateVideoThumbnail(
  sourcePath: string,
  fileName: string
): Promise<string> {
  const thumbName = `thumb_${path.parse(fileName).name}.webp`;
  let webp: Buffer;

  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);
    const tempDir = path.join(process.cwd(), "public/uploads/temp");
    await fs.mkdir(tempDir, { recursive: true });
    const tempPng = path.join(tempDir, `temp_${Date.now()}.png`);

    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      sourcePath,
      "-ss",
      "00:00:01",
      "-vframes",
      "1",
      "-q:v",
      "2",
      tempPng,
    ]);

    webp = await sharp(tempPng)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();

    await fs.unlink(tempPng).catch(() => undefined);
  } catch {
    webp = await sharp({
      create: {
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT,
        channels: 3,
        background: { r: 37, g: 99, b: 235 },
      },
    })
      .webp({ quality: 80 })
      .toBuffer();
  }

  return saveMediaFile("thumbnails", thumbName, webp, "image/webp");
}
