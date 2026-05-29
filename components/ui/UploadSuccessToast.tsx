"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useMediaContext } from "@/contexts/MediaContext";

export function UploadSuccessToast() {
  const { uploadSuccess } = useMediaContext();

  return (
    <AnimatePresence>
      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-28 left-1/2 z-[100] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-full glass-strong px-6 py-3 shadow-2xl">
            <CheckCircle2 className="h-6 w-6 text-primary-light" />
            <span className="font-medium text-white">Upload complete</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
