"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { MediaFilters, MediaItem, TabType } from "@/types/media";
import { filterMedia } from "@/lib/filters";

interface MediaContextValue {
  items: MediaItem[];
  setItems: React.Dispatch<React.SetStateAction<MediaItem[]>>;
  addItems: (newItems: MediaItem[]) => void;
  updateItem: (id: string, patch: Partial<MediaItem>) => void;
  removeItem: (id: string) => void;
  filters: MediaFilters;
  setFilters: React.Dispatch<React.SetStateAction<MediaFilters>>;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  filteredItems: MediaItem[];
  hoveredItem: MediaItem | null;
  setHoveredItem: (item: MediaItem | null) => void;
  backgroundItem: MediaItem | null;
  setBackgroundItem: (item: MediaItem | null) => void;
  selectedItem: MediaItem | null;
  setSelectedItem: (item: MediaItem | null) => void;
  viewerOpen: boolean;
  setViewerOpen: (open: boolean) => void;
  uploadSuccess: boolean;
  triggerUploadSuccess: () => void;
}

const MediaContext = createContext<MediaContextValue | null>(null);

const defaultFilters: MediaFilters = {
  query: "",
  type: "all",
  sort: "recent",
};

export function MediaProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filters, setFilters] = useState<MediaFilters>(defaultFilters);
  const [activeTab, setActiveTab] = useState<TabType>("images");
  const [hoveredItem, setHoveredItem] = useState<MediaItem | null>(null);
  const [backgroundItem, setBackgroundItem] = useState<MediaItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const addItems = useCallback((newItems: MediaItem[]) => {
    setItems((prev) => [...newItems, ...prev]);
  }, []);

  const updateItem = useCallback((id: string, patch: Partial<MediaItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const triggerUploadSuccess = useCallback(() => {
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2400);
  }, []);

  const tabFiltered = useMemo(() => {
    const type = activeTab === "images" ? "image" : "video";
    return filterMedia(
      items.filter((i) => i.mediaType === type),
      { ...filters, type }
    );
  }, [items, filters, activeTab]);

  const filteredItems = tabFiltered;

  const value = useMemo(
    () => ({
      items,
      setItems,
      addItems,
      updateItem,
      removeItem,
      filters,
      setFilters,
      activeTab,
      setActiveTab,
      filteredItems,
      hoveredItem,
      setHoveredItem,
      backgroundItem,
      setBackgroundItem,
      selectedItem,
      setSelectedItem,
      viewerOpen,
      setViewerOpen,
      uploadSuccess,
      triggerUploadSuccess,
    }),
    [
      items,
      addItems,
      updateItem,
      removeItem,
      filters,
      activeTab,
      filteredItems,
      hoveredItem,
      backgroundItem,
      selectedItem,
      viewerOpen,
      uploadSuccess,
      triggerUploadSuccess,
    ]
  );

  return (
    <MediaContext.Provider value={value}>{children}</MediaContext.Provider>
  );
}

export function useMediaContext() {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error("useMediaContext must be used within MediaProvider");
  }
  return ctx;
}
