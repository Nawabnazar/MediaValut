import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const THUMB_DIR = path.join(process.cwd(), "public/uploads/thumbnails");
const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 360;

export async function ensureThumbnailDir(): Promise<void> {
  await fs.mkdir(THUMB_DIR, { recursive: true });
}

export async function generateImageThumbnail(
  sourcePath: string,
  fileName: string
): Promise<string> {
  await ensureThumbnailDir();
  const thumbName = `thumb_${path.parse(fileName).name}.webp`;
  const thumbPath = path.join(THUMB_DIR, thumbName);

  await sharp(sourcePath)
    .resize(THUMB_WIDTH, THUMB_HEIGHT, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: 82 })
    .toFile(thumbPath);

  return `/uploads/thumbnails/${thumbName}`;
}

export async function generateVideoThumbnail(
  sourcePath: string,
  fileName: string
): Promise<string> {
  await ensureThumbnailDir();
  const thumbName = `thumb_${path.parse(fileName).name}.webp`;
  const thumbPath = path.join(THUMB_DIR, thumbName);

  try {
    const { execFile } = await import("child_process");
    const { promisify } = await import("util");
    const execFileAsync = promisify(execFile);

    const tempPng = path.join(THUMB_DIR, `temp_${Date.now()}.png`);
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

    await sharp(tempPng)
      .resize(THUMB_WIDTH, THUMB_HEIGHT, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(thumbPath);

    await fs.unlink(tempPng).catch(() => undefined);
  } catch {
    await sharp({
      create: {
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT,
        channels: 3,
        background: { r: 37, g: 99, b: 235 },
      },
    })
      .webp({ quality: 80 })
      .toFile(thumbPath);
  }

  return `/uploads/thumbnails/${thumbName}`;
}
