"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { FeaturedStack } from "@/components/gallery/FeaturedStack";
import { MediaCard } from "@/components/gallery/MediaCard";
import { FolderStack } from "@/components/gallery/FolderStack";
import { useMediaContext } from "@/contexts/MediaContext";
import type { MediaItem } from "@/types/media";

const VirtualizedGallery = dynamic(
  () =>
    import("@/components/gallery/VirtualizedGallery").then(
      (m) => m.VirtualizedGallery
    ),
  { ssr: false }
);

const VIRTUAL_THRESHOLD = 80;
const STACK_SKIP = 5;

export function MasonryGallery() {
  const { filteredItems, hoveredItem, hoveredFolderId, setHoveredFolderId } = useMediaContext();

  const showStack = filteredItems.length >= 3;
  const gridItems = showStack
    ? filteredItems.slice(STACK_SKIP)
    : filteredItems;
  const useVirtual = filteredItems.length > VIRTUAL_THRESHOLD;

  // Preprocess grid items to group unhovered folder items into a single folder stack item
  const renderableItems = useMemo(() => {
    const result: (
      | { type: "single"; item: MediaItem }
      | { type: "folder"; id: string; name: string; items: MediaItem[] }
    )[] = [];
    const processedFolders = new Set<string>();

    gridItems.forEach((item) => {
      if (item.folderGroupId) {
        if (hoveredFolderId === item.folderGroupId) {
          // If the folder is hovered, render all items inside it as singles
          result.push({ type: "single", item });
        } else {
          // If the folder is not hovered, render only one stack card for this group
          if (!processedFolders.has(item.folderGroupId)) {
            processedFolders.add(item.folderGroupId);
            const folderItems = gridItems.filter(
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
  }, [gridItems, hoveredFolderId]);

  if (!filteredItems.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[40vh] flex-col items-center justify-center text-center"
      >
        <p className="text-lg font-medium text-white/70">No media yet</p>
        <p className="mt-2 text-sm text-white/40">
          Upload images or videos to get started
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-7xl"
    >
      {showStack && (
        <FeaturedStack items={filteredItems.slice(0, STACK_SKIP)} />
      )}

      {useVirtual ? (
        <VirtualizedGallery startIndex={showStack ? STACK_SKIP : 0} />
      ) : renderableItems.length > 0 ? (
        <div className="columns-2 gap-4 px-4 pb-32 sm:columns-3 sm:px-6 lg:columns-4 lg:px-8 xl:columns-5">
          {renderableItems.map((renderItem, index) => {
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
                index={index}
                isDimmed={
                  hoveredItem !== null && hoveredItem.id !== renderItem.item.id
                }
              />
            );
          })}
        </div>
      ) : null}
    </motion.div>
  );
}
