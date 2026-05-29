"use client";

import { motion } from "framer-motion";
import { Image, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMediaContext } from "@/contexts/MediaContext";
import type { TabType } from "@/types/media";

const tabs: { id: TabType; label: string; icon: typeof Image }[] = [
  { id: "images", label: "Images", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
];

export function GalleryTabs() {
  const { activeTab, setActiveTab } = useMediaContext();

  return (
    <div className="relative z-20 mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="inline-flex rounded-full glass p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-white" : "text-white/50 hover:text-white/80"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-primary shadow-md shadow-primary/40"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
