"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState, useMemo } from "react";
import { MediaCard } from "@/components/gallery/MediaCard";
import { FolderStack } from "@/components/gallery/FolderStack";
import { useMediaContext } from "@/contexts/MediaContext";
import type { MediaItem } from "@/types/media";

function getColumnCount(width: number): number {
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
}

interface VirtualizedGalleryProps {
  startIndex?: number;
}

export function VirtualizedGallery({ startIndex = 0 }: VirtualizedGalleryProps) {
  const { filteredItems, hoveredItem, hoveredFolderId, setHoveredFolderId } = useMediaContext();
  const items = filteredItems.slice(startIndex);
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Preprocess items to group unhovered folder items into a single folder stack item
  const renderableItems = useMemo(() => {
    const result: (
      | { type: "single"; item: MediaItem }
      | { type: "folder"; id: string; name: string; items: MediaItem[] }
    )[] = [];
    const processedFolders = new Set<string>();

    items.forEach((item) => {
      if (item.folderGroupId) {
        if (hoveredFolderId === item.folderGroupId) {
          // If the folder is hovered, render all items inside it as singles
          result.push({ type: "single", item });
        } else {
          // If the folder is not hovered, render only one stack card for this group
          if (!processedFolders.has(item.folderGroupId)) {
            processedFolders.add(item.folderGroupId);
            const folderItems = items.filter(
              (i) => i.folderGroupId === item.folderGroupId
            );
            result.push({
              type: "folder",
              id: item.folderGroupId,
              name: item.folderName ?? "Uploaded folder",
              items: folderItems,
            });
          }
        }
      } else {
        result.push({ type: "single", item });
      }
    });

    return result;
  }, [items, hoveredFolderId]);

  const rowCount = Math.ceil(renderableItems.length / columnCount) || 1;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 4,
  });

  if (!renderableItems.length) return null;

  return (
    <div
      ref={parentRef}
      className="relative mx-auto max-h-[calc(100vh-320px)] max-w-7xl overflow-auto px-4 pb-32 scrollbar-hide sm:px-6 lg:px-8"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columnCount;
          const rowItems = renderableItems.slice(start, start + columnCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
                display: "grid",
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                gap: "1rem",
                paddingBottom: "1rem",
              }}
            >
              {rowItems.map((renderItem, colIndex) => {
                if (renderItem.type === "folder") {
                  return (
                    <FolderStack
                      key={renderItem.id}
                      name={renderItem.name}
                      items={renderItem.items}
                      onMouseEnter={() => setHoveredFolderId(renderItem.id)}
                    />
                  );
                }

                return (
                  <MediaCard
                    key={renderItem.item.id}
                    item={renderItem.item}
                    index={startIndex + start + colIndex}
                    isDimmed={
                      hoveredItem !== null && hoveredItem.id !== renderItem.item.id
                    }
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
