"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Pause,
  Play,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaContext } from "@/contexts/MediaContext";
import { getFullSizeUrl } from "@/lib/media";

export function FullScreenViewer() {
  const {
    viewerOpen,
    setViewerOpen,
    selectedItem,
    setSelectedItem,
    filteredItems,
  } = useMediaContext();

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentIndex = selectedItem
    ? filteredItems.findIndex((i) => i.id === selectedItem.id)
    : -1;

  const navigate = useCallback(
    (direction: -1 | 1) => {
      if (currentIndex < 0) return;
      const next =
        filteredItems[
          (currentIndex + direction + filteredItems.length) %
            filteredItems.length
        ];
      if (next) {
        setSelectedItem(next);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    },
    [currentIndex, filteredItems, setSelectedItem]
  );

  const close = useCallback(() => {
    setViewerOpen(false);
    setSelectedItem(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [setViewerOpen, setSelectedItem]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen, close, navigate]);

  useEffect(() => {
    document.body.style.overflow = viewerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [viewerOpen]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (selectedItem?.mediaType !== "image" || zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.current.panX + (e.clientX - dragStart.current.x),
      y: dragStart.current.panY + (e.clientY - dragStart.current.y),
    });
  };

  const handlePanEnd = () => setIsDragging(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleFullscreen = () => {
    const el = videoRef.current ?? document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const isVideo = selectedItem?.mediaType === "video";

  return (
    <AnimatePresence>
      {viewerOpen && selectedItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between p-4">
            <p className="truncate text-sm font-medium text-white/80">
              {selectedItem.fileName}
            </p>
            <button
              type="button"
              onClick={close}
              className="rounded-full p-2 text-white/70 hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="absolute left-4 z-10 rounded-full glass p-3 text-white"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[75vh] max-w-[90vw]"
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                cursor: zoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
              }}
            >
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={getFullSizeUrl(selectedItem)}
                  autoPlay
                  controls
                  className="max-h-[75vh] max-w-[90vw] rounded-[16px]"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getFullSizeUrl(selectedItem)}
                  alt={selectedItem.fileName}
                  className="max-h-[75vh] max-w-[90vw] rounded-[16px] object-contain"
                  draggable={false}
                />
              )}
            </motion.div>

            <button
              type="button"
              onClick={() => navigate(1)}
              className="absolute right-4 z-10 rounded-full glass p-3 text-white"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 p-6">
            {!isVideo ? (
              <>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
                  className="rounded-full glass p-3 text-white"
                >
                  <ZoomOut className="h-5 w-5" />
                </button>
                <span className="min-w-[4rem] text-center text-sm text-white/60">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
                  className="rounded-full glass p-3 text-white"
                >
                  <ZoomIn className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={togglePlay}
                  className="rounded-full glass p-3 text-white"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-full glass p-3 text-white"
                >
                  <Maximize className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
