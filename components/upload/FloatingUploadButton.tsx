"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FolderOpen,
  ImageIcon,
  ImagePlus,
  Plus,
  Video,
} from "lucide-react";
import { useState } from "react";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { cn } from "@/lib/utils";
import type { UploadConfig } from "@/types/upload";

const defaultConfig: UploadConfig = {
  mediaType: "image",
  mode: "multiple",
};

export function FloatingUploadButton() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropzoneOpen, setDropzoneOpen] = useState(false);
  const [config, setConfig] = useState<UploadConfig>(defaultConfig);

  const openUpload = (next: UploadConfig) => {
    setConfig(next);
    setMenuOpen(false);
    setDropzoneOpen(true);
  };

  const menuItems: {
    label: string;
    icon: typeof ImageIcon;
    config: UploadConfig;
  }[] = [
    {
      label: "Single photo",
      icon: ImageIcon,
      config: { mediaType: "image", mode: "single" },
    },
    {
      label: "Upload folder",
      icon: FolderOpen,
      config: { mediaType: "image", mode: "folder" },
    },
    {
      label: "Multiple photos",
      icon: ImagePlus,
      config: { mediaType: "image", mode: "multiple" },
    },
    {
      label: "Single video",
      icon: Video,
      config: { mediaType: "video", mode: "single" },
    },
    {
      label: "Video folder",
      icon: FolderOpen,
      config: { mediaType: "video", mode: "folder" },
    },
    {
      label: "Multiple videos",
      icon: Video,
      config: { mediaType: "video", mode: "multiple" },
    },
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-3">
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto rounded-[20px] glass-strong p-2 shadow-2xl scrollbar-hide"
            >
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => openUpload(item.config)}
                  className="flex items-center gap-3 rounded-[16px] px-4 py-3 text-left text-sm font-medium text-white hover:bg-white/10"
                >
                  <item.icon className="h-5 w-5 shrink-0 text-primary-light" />
                  {item.label}
                </button>
              ))}
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
        config={config}
      />
    </>
  );
}
