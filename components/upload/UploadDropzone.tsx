"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileImage, FileVideo, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { invalidateCache, MEDIA_LIST_KEY } from "@/lib/cache";
import { cn } from "@/lib/utils";
import { useMediaContext } from "@/contexts/MediaContext";
import type { MediaItem } from "@/types/media";

interface UploadDropzoneProps {
  open: boolean;
  onClose: () => void;
  accept: "image" | "video" | "both";
}

export function UploadDropzone({ open, onClose, accept }: UploadDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addItems, triggerUploadSuccess } = useMediaContext();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      try {
        setProgress(40);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        setProgress(80);

        if (!res.ok) throw new Error("Upload failed");

        const data = (await res.json()) as { items: MediaItem[] };
        invalidateCache(MEDIA_LIST_KEY);
        addItems(data.items);
        setProgress(100);
        triggerUploadSuccess();
        setTimeout(onClose, 400);
      } catch (err) {
        console.error(err);
        alert("Upload failed. Please try again.");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [addItems, onClose, triggerUploadSuccess]
  );

  const acceptMap: Accept =
    accept === "image"
      ? { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"] }
      : accept === "video"
        ? { "video/*": [".mp4", ".webm", ".mov", ".ogg"] }
        : {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
            "video/*": [".mp4", ".webm", ".mov"],
          };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    multiple: true,
    disabled: uploading,
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 z-[95] mx-auto max-w-lg -translate-y-1/2 rounded-[24px] glass-strong p-6 shadow-2xl sm:inset-x-auto"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Upload Media</h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-white/60 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-[20px] border-2 border-dashed p-10 text-center transition",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-white/20 hover:border-primary/50"
              )}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto mb-4 h-10 w-10 text-primary-light" />
              <p className="font-medium text-white">
                {isDragActive
                  ? "Drop files here"
                  : "Drag & drop or click to browse"}
              </p>
              <p className="mt-2 text-sm text-white/50">
                Multi-file upload supported
              </p>
              <div className="mt-4 flex justify-center gap-4 text-white/40">
                <FileImage className="h-5 w-5" />
                <FileVideo className="h-5 w-5" />
              </div>
            </div>

            {uploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4"
              >
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-sm text-white/60">
                  Uploading...
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
