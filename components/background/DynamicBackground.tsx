"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMediaContext } from "@/contexts/MediaContext";
import { getBackgroundUrl, getFullSizeUrl } from "@/lib/media";

export function DynamicBackground() {
  const { hoveredItem } = useMediaContext();
  const active = hoveredItem;
  const isHoverPreview = !!hoveredItem;
  const url = active
    ? isHoverPreview && active.mediaType === "image"
      ? getFullSizeUrl(active)
      : getBackgroundUrl(active)
    : null;
  const isVideo = active?.mediaType === "video";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <AnimatePresence mode="sync">
        {url && active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: isHoverPreview ? 1.06 : 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            {isVideo && isHoverPreview ? (
              <video
                src={getFullSizeUrl(active)}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt=""
                className="h-full w-full object-cover"
              />
            )}

            <motion.div
              animate={{
                backdropFilter: isHoverPreview ? "blur(8px)" : "blur(20px)",
              }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0"
              style={{
                backgroundColor: isHoverPreview
                  ? "rgba(0,0,0,0.25)"
                  : "rgba(0,0,0,0.55)",
              }}
            />

            <div
              className={
                isHoverPreview
                  ? "absolute inset-0 bg-gradient-to-b from-primary/30 via-primary/5 to-black/40"
                  : "absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-black/60"
              }
            />

            {isHoverPreview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 ring-1 ring-inset ring-white/10"
              />
            )}
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
