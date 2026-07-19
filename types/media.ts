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
  folderGroupId: string | null;
  folderName: string | null;
}

export interface MediaFolderGroup {
  folderGroupId: string;
  folderName: string;
  items: MediaItem[];
  uploadDate: string;
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
