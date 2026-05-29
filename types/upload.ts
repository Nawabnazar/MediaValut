export type UploadMediaType = "image" | "video" | "both";

/** single = one file picker; multiple = many files; folder = entire directory */
export type UploadMode = "single" | "multiple" | "folder";

export interface UploadConfig {
  mediaType: UploadMediaType;
  mode: UploadMode;
}
