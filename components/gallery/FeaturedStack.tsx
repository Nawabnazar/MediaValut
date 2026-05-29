"use client";

import { MediaCard } from "@/components/gallery/MediaCard";
import { useMediaContext } from "@/contexts/MediaContext";
import type { MediaItem } from "@/types/media";

interface FeaturedStackProps {
  items: MediaItem[];
}

export function FeaturedStack({ items }: FeaturedStackProps) {
  const { hoveredItem } = useMediaContext();

  if (items.length < 3) return null;

  const stackSize = Math.min(5, items.length);

  return (
    <div className="relative mx-auto mb-10 max-w-md px-4 sm:max-w-lg">
      <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-white/40">
        Featured Stack
      </p>
      <div
        className="relative flex justify-center"
        style={{ perspective: "1200px", minHeight: 300 }}
      >
        {items.slice(0, stackSize).map((item, i) => (
          <div
            key={item.id}
            className="absolute w-[70%] max-w-sm"
            style={{
              transform: `translateX(${(i - (stackSize - 1) / 2) * 24}px) translateZ(${-i * 40}px) rotateY(${(i - (stackSize - 1) / 2) * 4}deg)`,
            }}
          >
            <MediaCard
              item={item}
              index={i}
              stackOffset={i}
              isDimmed={hoveredItem !== null && hoveredItem.id !== item.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
