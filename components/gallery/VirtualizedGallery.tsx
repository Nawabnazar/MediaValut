"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useEffect, useRef, useState } from "react";
import { MediaCard } from "@/components/gallery/MediaCard";
import { useMediaContext } from "@/contexts/MediaContext";

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
  const { filteredItems, hoveredItem } = useMediaContext();
  const items = filteredItems.slice(startIndex);
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(4);

  useEffect(() => {
    const update = () => setColumnCount(getColumnCount(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rowCount = Math.ceil(items.length / columnCount) || 1;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 280,
    overscan: 4,
  });

  if (!items.length) return null;

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
          const rowItems = items.slice(start, start + columnCount);

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
              {rowItems.map((item, colIndex) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  index={startIndex + start + colIndex}
                  isDimmed={
                    hoveredItem !== null && hoveredItem.id !== item.id
                  }
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
