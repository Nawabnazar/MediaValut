"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Plus, Video } from "lucide-react";
import { useState } from "react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { cn } from "@/lib/utils";

export function FloatingUploadButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropzoneOpen, setDropzoneOpen] = useState(false);
  const [accept, setAccept] = useState<"image" | "video" | "both">("both");

  const openDropzone = (type: "image" | "video" | "both") => {
    setAccept(type);
    setMenuOpen(false);
    setDropzoneOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              className="flex flex-col gap-2 rounded-[20px] glass-strong p-2 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => openDropzone("image")}
                className="flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <ImagePlus className="h-5 w-5 text-primary-light" />
                Upload Images
              </button>
              <button
                type="button"
                onClick={() => openDropzone("video")}
                className="flex items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                <Video className="h-5 w-5 text-primary-light" />
                Upload Videos
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMenuOpen((o) => !o)}
          className={cn(
            "flex h-16 w-16 items-center justify-center rounded-full",
            "bg-primary text-white shadow-2xl shadow-primary/40"
          )}
          aria-label="Upload menu"
        >
          <motion.div
            animate={{ rotate: menuOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="h-8 w-8" />
          </motion.div>
        </motion.button>
      </div>

      <UploadDropzone
        open={dropzoneOpen}
        onClose={() => setDropzoneOpen(false)}
        accept={accept}
      />
    </>
  );
}
