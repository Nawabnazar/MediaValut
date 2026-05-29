export type MediaType = "image" | "video";

export type SortOrder = "recent" | "oldest";

export type TabType = "images" | "videos";

export interface MediaItem {
  id: string;
  fileName: string;
  filePath: string;
  mediaType: MediaType;
  uploadDate: string;
  fileSize: number;
  thumbnailPath: string | null;
}

export interface MediaFilters {
  query: string;
  type: MediaType | "all";
  sort: SortOrder;
}

export interface UploadResult {
  success: boolean;
  media?: MediaItem;
  error?: string;
}
