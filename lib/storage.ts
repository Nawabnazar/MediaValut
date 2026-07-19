import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin, getSupabasePublicUrl } from "@/lib/supabase/server";
import { isSupabaseStorageEnabled } from "@/lib/config";

export type StorageBucket = "images" | "videos" | "thumbnails";

export async function saveMediaFile(
  bucket: StorageBucket,
  fileName: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  if (isSupabaseStorageEnabled()) {
    const supabase = getSupabaseAdmin()!;
    const { error } = await supabase.storage.from(bucket).upload(fileName, buffer, {
      contentType,
      upsert: false,
    });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    return getSupabasePublicUrl(bucket, fileName);
  }

  const localDir = path.join(process.cwd(), "public/uploads", bucket);
  await fs.mkdir(localDir, { recursive: true });
  const diskPath = path.join(localDir, fileName);
  await fs.writeFile(diskPath, buffer);
  return `/uploads/${bucket}/${fileName}`;
}

export async function deleteMediaFile(
  filePath: string,
  bucket?: StorageBucket
): Promise<void> {
  if (filePath.startsWith("http")) {
    if (!isSupabaseStorageEnabled() || !bucket) return;
    const supabase = getSupabaseAdmin()!;
    const fileName = filePath.split("/").pop();
    if (fileName) {
      await supabase.storage.from(bucket).remove([fileName]);
    }
    return;
  }

  const relative = filePath.replace(/^\//, "");
  const fullPath = path.join(process.cwd(), "public", relative);
  await fs.unlink(fullPath).catch(() => undefined);
}

export async function saveTempFile(
  fileName: string,
  buffer: Buffer
): Promise<string> {
  const tempDir = path.join(process.cwd(), "public/uploads/temp");
  await fs.mkdir(tempDir, { recursive: true });
  const diskPath = path.join(tempDir, fileName);
  await fs.writeFile(diskPath, buffer);
  return diskPath;
}

export async function removeTempFile(diskPath: string): Promise<void> {
  await fs.unlink(diskPath).catch(() => undefined);
}
