"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { MediaActionMenu } from "@/components/actions/MediaActionMenu";
import { useMediaContext } from "@/contexts/MediaContext";
import { getDisplayUrl, getFullSizeUrl } from "@/lib/media";
import { formatDate, formatFileSize, cn } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

interface MediaCardProps {
  item: MediaItem;
  index: number;
  stackOffset?: number;
  isDimmed?: boolean;
}

export function MediaCard({
  item,
  index,
  stackOffset = 0,
  isDimmed = false,
}: MediaCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { hoveredItem, setHoveredItem, setSelectedItem, setViewerOpen } =
    useMediaContext();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const isHovered = hoveredItem?.id === item.id;
  const isVideo = item.mediaType === "video";
  const displayUrl = getDisplayUrl(item);

  const handleMouseEnter = () => {
    setHoveredItem(item);
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => undefined);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const openViewer = () => {
    setSelectedItem(item);
    setViewerOpen(true);
  };

  const heightClass =
    index % 5 === 0
      ? "h-72"
      : index % 3 === 0
        ? "h-56"
        : index % 2 === 0
          ? "h-64"
          : "h-48";

  return (
    <motion.div
      ref={ref}
      layout
      style={{
        y: parallaxY,
        zIndex: isHovered ? 50 : 10 - stackOffset,
        marginLeft: stackOffset > 0 ? -stackOffset * 12 : 0,
        transform: stackOffset
          ? `perspective(1000px) rotateY(${stackOffset * 2}deg)`
          : undefined,
      }}
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: isDimmed ? 0.45 : 1,
        y: 0,
        scale: isHovered ? 1.02 : 1,
      }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.3) }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        e.stopPropagation();
        openViewer();
      }}
      className={cn(
        "group relative cursor-pointer masonry-column",
        stackOffset > 0 && "first:ml-0"
      )}
    >
      <motion.div
        animate={{
          scale: isHovered ? 1.25 : 1,
          z: isHovered ? 80 : 0,
          boxShadow: isHovered
            ? "0 25px 50px -12px rgba(37, 99, 235, 0.45)"
            : "0 10px 30px -10px rgba(0,0,0,0.3)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={cn(
          "glass-reflection relative overflow-hidden rounded-[24px]",
          "border border-white/15 will-change-transform",
          heightClass,
          "w-full"
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {!loaded && (
          <div className="absolute inset-0 skeleton-shimmer" aria-hidden />
        )}

        {isVideo ? (
          <>
            <video
              ref={videoRef}
              src={getFullSizeUrl(item)}
              muted
              loop
              playsInline
              preload="metadata"
              poster={displayUrl}
              className={cn(
                "h-full w-full object-cover transition-opacity",
                loaded ? "opacity-100" : "opacity-0"
              )}
              onLoadedData={() => setLoaded(true)}
            />
            {!isHovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full glass-strong">
                  <Play className="ml-1 h-6 w-6 fill-white text-white" />
                </div>
              </div>
            )}
          </>
        ) : (
          <Image
            src={displayUrl}
            alt={item.fileName}
            fill
            loading="lazy"
            className={cn(
              "object-cover transition-opacity duration-300",
              loaded ? "opacity-100" : "opacity-0"
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            onLoad={() => setLoaded(true)}
            unoptimized={displayUrl.startsWith("/uploads")}
          />
        )}

        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 ring-2 ring-primary/60 ring-offset-2 ring-offset-transparent"
          />
        )}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4",
            "translate-y-full opacity-0 transition-all duration-300",
            "group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <p className="truncate text-sm font-medium text-white">
            {item.fileName}
          </p>
          <p className="text-xs text-white/60">
            {formatFileSize(item.fileSize)} · {formatDate(item.uploadDate)}
          </p>
        </div>

        <div className="absolute right-3 top-3">
          <MediaActionMenu item={item} onView={openViewer} />
        </div>
      </motion.div>
    </motion.div>
  );
}
