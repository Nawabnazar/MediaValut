"use client";

import { Folder } from "lucide-react";
import Image from "next/image";
import { getDisplayUrl } from "@/lib/media";
import { formatUploadTimestamp } from "@/lib/utils";
import type { MediaItem } from "@/types/media";

interface FolderStackProps {
  name: string;
  items: MediaItem[];
  onMouseEnter: () => void;
}

export function FolderStack({ name, items, onMouseEnter }: FolderStackProps) {
  const topItem = items[0];
  if (!topItem) return null;

  const displayUrl = getDisplayUrl(topItem);

  // Height class pattern matching the index-based heights of masonry to keep grid layout natural
  const heightClass = "h-64 sm:h-72";

  return (
    <div
      onMouseEnter={onMouseEnter}
      className="group relative cursor-pointer w-full mb-6 select-none"
    >
      {/* Background card 2 */}
      {items.length > 2 && (
        <div
          className="absolute inset-0 rounded-[24px] bg-slate-900/40 border border-white/5 shadow-lg origin-bottom transition-all duration-500 ease-out group-hover:rotate-[-8deg] group-hover:translate-x-[-14px] group-hover:translate-y-[-6px]"
          style={{
            transform: "rotate(-3deg) translateY(6px) scale(0.95)",
            zIndex: 10,
          }}
        />
      )}

      {/* Background card 1 */}
      {items.length > 1 && (
        <div
          className="absolute inset-0 rounded-[24px] bg-slate-900/60 border border-white/10 shadow-md origin-bottom transition-all duration-500 ease-out group-hover:rotate-[8deg] group-hover:translate-x-[14px] group-hover:translate-y-[-3px]"
          style={{
            transform: "rotate(3deg) translateY(3px) scale(0.98)",
            zIndex: 20,
          }}
        />
      )}

      {/* Top card */}
      <div
        className={`absolute inset-0 rounded-[24px] glass-reflection border border-white/15 overflow-hidden shadow-2xl transition-all duration-500 ease-out ${heightClass}`}
        style={{ zIndex: 30 }}
      >
        <Image
          src={displayUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          unoptimized={displayUrl.startsWith("/uploads")}
        />
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/45" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-5 text-white z-10">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-primary/80 backdrop-blur-md border border-primary-light/35 shadow-md">
              <Folder className="h-3.5 w-3.5 fill-white/10" />
              Folder
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/10">
              {items.length} item{items.length > 1 ? "s" : ""}
            </span>
          </div>

          <div>
            <h4 className="text-base font-semibold tracking-wide truncate mb-1">
              {name}
            </h4>
            <p className="text-[10px] text-white/60 font-medium">
              Uploaded: {formatUploadTimestamp(topItem.uploadDate)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Visual spacer to prevent grid collapse if absolutely positioned cards are layout containers */}
      <div className={`invisible ${heightClass}`} />
    </div>
  );
}
