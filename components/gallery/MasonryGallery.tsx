"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { FeaturedStack } from "@/components/gallery/FeaturedStack";
import { MediaCard } from "@/components/gallery/MediaCard";
import { useMediaContext } from "@/contexts/MediaContext";

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
  const { filteredItems, hoveredItem } = useMediaContext();

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

  const showStack = filteredItems.length >= 3;
  const gridItems = showStack
    ? filteredItems.slice(STACK_SKIP)
    : filteredItems;
  const useVirtual = filteredItems.length > VIRTUAL_THRESHOLD;

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
      ) : gridItems.length > 0 ? (
        <div className="columns-2 gap-4 px-4 pb-32 sm:columns-3 sm:px-6 lg:columns-4 lg:px-8 xl:columns-5">
          {gridItems.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              index={index}
              isDimmed={
                hoveredItem !== null && hoveredItem.id !== item.id
              }
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
