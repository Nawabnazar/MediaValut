"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FileImage,
  FileVideo,
  FolderOpen,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { invalidateCache, MEDIA_LIST_KEY } from "@/lib/cache";
import {
  filterFilesForUpload,
  uploadFilesInBatches,
  uploadModeLabel,
  createFolderGroupId,
  extractFolderName,
} from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { useMediaContext } from "@/contexts/MediaContext";
import type { UploadConfig } from "@/types/upload";

interface UploadDropzoneProps {
  open: boolean;
  onClose: () => void;
  config: UploadConfig;
}

export function UploadDropzone({ open, onClose, config }: UploadDropzoneProps) {
  const { mediaType, mode } = config;
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const singleInputRef = useRef<HTMLInputElement>(null);
  const { addItems, triggerUploadSuccess } = useMediaContext();

  const title = uploadModeLabel(mode, mediaType);

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const files =
        mode === "single"
          ? filterFilesForUpload(rawFiles, mediaType).slice(0, 1)
          : filterFilesForUpload(rawFiles, mediaType);

      if (!files.length) {
        alert(
          mode === "folder"
            ? "No valid images or videos found in that folder."
            : "No valid files selected."
        );
        return;
      }

      setUploading(true);
      setProgress(0);
      setUploadedCount(0);
      setTotalCount(files.length);

      try {
        const meta =
          mode === "folder"
            ? {
              folderGroupId: createFolderGroupId(),
              folderName: extractFolderName(rawFiles),
            }
            : undefined;

        const items = await uploadFilesInBatches(
          files,
          (pct, done, total) => {
            setProgress(pct);
            setUploadedCount(done);
            setTotalCount(total);
          },
          meta
        );

        invalidateCache(MEDIA_LIST_KEY);
        addItems(items);
        setProgress(100);
        triggerUploadSuccess();
        setTimeout(onClose, 500);
      } catch (err) {
        console.error(err);
        alert(
          err instanceof Error ? err.message : "Upload failed. Please try again."
        );
      } finally {
        setUploading(false);
        setProgress(0);
        setUploadedCount(0);
        setTotalCount(0);
      }
    },
    [addItems, mediaType, mode, onClose, triggerUploadSuccess]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void processFiles(acceptedFiles);
    },
    [processFiles]
  );

  const acceptMap: Accept = useMemo((): Accept => {
    if (mediaType === "image") {
      return { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".heic"] };
    }
    if (mediaType === "video") {
      return { "video/*": [".mp4", ".webm", ".mov", ".ogg", ".m4v"] };
    }
    return {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov"],
    } as Accept;
  }, [mediaType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptMap,
    multiple: mode !== "single",
    disabled: uploading,
    noClick: mode === "folder",
    noKeyboard: mode === "folder",
  });

  const handleFolderPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) void processFiles(Array.from(list));
    e.target.value = "";
  };

  const handleSinglePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list?.length) void processFiles(Array.from(list));
    e.target.value = "";
  };

  const hint =
    mode === "folder"
      ? "All images in the folder will be uploaded"
      : mode === "single"
        ? "Select one photo or video"
        : "Select or drop multiple files";

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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex  items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-xs text-white/50">{hint}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-white/60 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {mode === "folder" ? (
              <div className="space-y-3">
                <input
                  ref={folderInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  {...({
                    webkitdirectory: "",
                    directory: "",
                  } as React.InputHTMLAttributes<HTMLInputElement>)}
                  onChange={handleFolderPick}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => folderInputRef.current?.click()}
                  className={cn(
                    "flex w-full flex-col items-center rounded-[20px] border-2 border-dashed p-10 transition",
                    "border-primary/50 bg-primary/10 hover:bg-primary/20"
                  )}
                >
                  <FolderOpen className="mb-4 h-12 w-12 text-primary-light" />
                  <span className="font-medium text-white">
                    Choose folder
                  </span>
                  <span className="mt-2 text-sm text-white/50">
                    Upload every image inside the folder
                  </span>
                </button>
                <div
                  {...getRootProps()}
                  className={cn(
                    "cursor-pointer rounded-[16px] border border-dashed p-6 text-center transition",
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-white/20 hover:border-primary/40"
                  )}
                >
                  <input {...getInputProps()} />
                  <p className="text-sm text-white/70">
                    {isDragActive
                      ? "Drop folder here"
                      : "Or drag a folder onto this area"}
                  </p>
                </div>
              </div>
            ) : mode === "single" ? (
              <div className="space-y-3">
                <input
                  ref={singleInputRef}
                  type="file"
                  className="hidden"
                  accept={
                    mediaType === "image"
                      ? "image/*"
                      : mediaType === "video"
                        ? "video/*"
                        : "image/*,video/*"
                  }
                  onChange={handleSinglePick}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => singleInputRef.current?.click()}
                  className={cn(
                    "flex w-full flex-col items-center rounded-[20px] border-2 border-dashed p-10 transition",
                    "border-primary/50 bg-primary/10 hover:bg-primary/20"
                  )}
                >
                  <ImageIcon className="mb-4 h-12 w-12 text-primary-light" />
                  <span className="font-medium text-white">
                    Choose one file
                  </span>
                </button>
                <div
                  {...getRootProps()}
                  className={cn(
                    "cursor-pointer rounded-[16px] border border-dashed p-4 text-center text-sm text-white/60",
                    isDragActive && "border-primary text-white"
                  )}
                >
                  <input {...getInputProps({ multiple: false })} />
                  Or drag a single file here
                </div>
              </div>
            ) : (
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
                  {isDragActive ? "Drop files here" : "Drag & drop or click to browse"}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  Multiple files supported
                </p>
                <div className="mt-4 flex justify-center gap-4 text-white/40">
                  <FileImage className="h-5 w-5" />
                  <FileVideo className="h-5 w-5" />
                </div>
              </div>
            )}

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
                  Uploading {uploadedCount} of {totalCount}… ({progress}%)
                </p>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
