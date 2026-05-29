"use client";

import { useEffect } from "react";
import useSWR from "swr";
import { useMediaContext } from "@/contexts/MediaContext";
import { getCached, MEDIA_LIST_KEY, setCached } from "@/lib/cache";
import type { MediaItem } from "@/types/media";

const fetcher = async (url: string) => {
  const cached = getCached<MediaItem[]>(MEDIA_LIST_KEY);
  if (cached) return cached;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = (await res.json()) as MediaItem[];
  setCached(MEDIA_LIST_KEY, data);
  return data;
};

export function useMediaFetch() {
  const { setItems } = useMediaContext();
  const { data, error, isLoading, mutate } = useSWR<MediaItem[]>(
    "/api/media",
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  useEffect(() => {
    if (data) setItems(data);
  }, [data, setItems]);

  return { isLoading, error, mutate };
}
