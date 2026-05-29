"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useMediaContext } from "@/contexts/MediaContext";
import { getBackgroundUrl, getFullSizeUrl } from "@/lib/media";

export function DynamicBackground() {
  const { backgroundItem, hoveredItem } = useMediaContext();
  const active = hoveredItem ?? backgroundItem;
  const url = active ? getBackgroundUrl(active) : null;
  const isVideo = active?.mediaType === "video";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        {url && (
          <motion.div
            key={active?.id ?? url}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {isVideo && hoveredItem ? (
              <video
                src={getFullSizeUrl(active)}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={url}
                alt=""
                fill
                priority
                className="object-cover"
                sizes="100vw"
                unoptimized={url.startsWith("/uploads")}
              />
            )}
            <div className="absolute inset-0 bg-black/55 backdrop-blur-[20px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-black/60" />
          </motion.div>
        )}
      </AnimatePresence>

      {!active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/30"
        />
      )}
    </div>
  );
}
