/** 1 GB total image storage quota */
export const MAX_IMAGE_STORAGE_BYTES = Number(
  process.env.MAX_IMAGE_STORAGE_BYTES ?? 1_073_741_824
);

/** 10 GB total video storage quota */
export const MAX_VIDEO_STORAGE_BYTES = Number(
  process.env.MAX_VIDEO_STORAGE_BYTES ?? 10_737_418_240
);

/** Max single image file (100 MB default) */
export const MAX_IMAGE_FILE_BYTES = Number(
  process.env.MAX_IMAGE_FILE_BYTES ?? 104_857_600
);

/** Max single video file (2 GB default) */
export const MAX_VIDEO_FILE_BYTES = Number(
  process.env.MAX_VIDEO_FILE_BYTES ?? 2_147_483_648
);

export function isSupabaseStorageEnabled(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function isSupabaseDbEnabled(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return url.includes("supabase") || url.startsWith("postgres");
}
