"use client";

import { motion } from "framer-motion";
import { ImageIcon, Search, Upload } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useMediaContext } from "@/contexts/MediaContext";

interface HeroSectionProps {
  onUploadClick: () => void;
}

export function HeroSection({ onUploadClick }: HeroSectionProps) {
  const { filters, setFilters } = useMediaContext();

  return (
    <motion.header
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 px-4 pt-6 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-primary shadow-lg shadow-primary/40"
            >
              <ImageIcon className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                MediaVault
              </h1>
              <p className="text-sm text-white/60">Your premium media library</p>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3 sm:max-w-2xl sm:justify-end">
            <div className="relative min-w-[200px] flex-1 sm:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                type="search"
                placeholder="Search by file name..."
                value={filters.query}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, query: e.target.value }))
                }
                className="w-full rounded-full glass py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 outline-none ring-primary/50 transition focus:ring-2"
              />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onUploadClick}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </motion.button>

            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
