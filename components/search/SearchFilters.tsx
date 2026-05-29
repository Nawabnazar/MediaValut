"use client";

import { motion } from "framer-motion";
import { ArrowDownAZ, ArrowUpAZ, Clock, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaContext } from "@/contexts/MediaContext";
import type { SortOrder } from "@/types/media";

const sortOptions: { id: SortOrder; label: string; icon: typeof Clock }[] = [
  { id: "recent", label: "Recent", icon: ArrowDownAZ },
  { id: "oldest", label: "Oldest", icon: ArrowUpAZ },
];

export function SearchFilters() {
  const { filters, setFilters, filteredItems } = useMediaContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative z-20 mx-auto mt-4 flex max-w-7xl flex-wrap items-center gap-3 px-4 sm:px-6 lg:px-8"
    >
      <div className="flex items-center gap-2 text-white/50">
        <Filter className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Filters
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          const active = filters.sort === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, sort: opt.id }))}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium transition",
                active
                  ? "bg-primary text-white shadow-md shadow-primary/30"
                  : "glass text-white/70 hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <span className="ml-auto text-sm text-white/40">
        {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
      </span>
    </motion.div>
  );
}
