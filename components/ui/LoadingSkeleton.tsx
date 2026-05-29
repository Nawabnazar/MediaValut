"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const heights = [180, 240, 200, 280, 160, 220, 260, 190];

export function LoadingSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
          className="masonry-column"
        >
          <div
            className={cn(
              "skeleton-shimmer w-full rounded-[24px]",
              "border border-white/10"
            )}
            style={{ height: heights[i % heights.length] }}
          />
        </motion.div>
      ))}
    </div>
  );
}
