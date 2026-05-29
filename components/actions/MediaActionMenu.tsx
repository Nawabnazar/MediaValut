"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Copy,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";
import { invalidateCache, MEDIA_LIST_KEY } from "@/lib/cache";
import { getFullSizeUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { useMediaContext } from "@/contexts/MediaContext";
import type { MediaItem } from "@/types/media";

interface MediaActionMenuProps {
  item: MediaItem;
  onView: () => void;
}

export function MediaActionMenu({ item, onView }: MediaActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(item.fileName);
  const { updateItem, removeItem } = useMediaContext();

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete "${item.fileName}"?`)) return;
    const res = await fetch(`/api/media/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      invalidateCache(MEDIA_LIST_KEY);
      removeItem(item.id);
    }
    setOpen(false);
  }, [item, removeItem]);

  const handleRename = useCallback(async () => {
    const res = await fetch(`/api/media/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: name }),
    });
    if (res.ok) {
      const updated = await res.json();
      updateItem(item.id, updated);
    }
    setRenaming(false);
    setOpen(false);
  }, [item.id, name, updateItem]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = getFullSizeUrl(item);
    a.download = item.fileName;
    a.click();
    setOpen(false);
  };

  const handleCopyPath = async () => {
    const full =
      typeof window !== "undefined"
        ? `${window.location.origin}${getFullSizeUrl(item)}`
        : getFullSizeUrl(item);
    await navigator.clipboard.writeText(full);
    setOpen(false);
  };

  const actions = [
    { icon: Eye, label: "View", onClick: onView },
    {
      icon: Pencil,
      label: "Rename",
      onClick: () => setRenaming(true),
    },
    { icon: Download, label: "Download", onClick: handleDownload },
    { icon: Copy, label: "Copy Path", onClick: handleCopyPath },
    { icon: Trash2, label: "Delete", onClick: handleDelete, danger: true },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full glass",
          "text-white/80 opacity-0 transition group-hover:opacity-100",
          open && "opacity-100"
        )}
        aria-label="Media actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            className="absolute right-0 top-10 z-50 min-w-[160px] overflow-hidden rounded-[20px] glass-strong py-1 shadow-2xl"
          >
            {renaming ? (
              <div className="p-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-2 w-full rounded-lg bg-white/10 px-2 py-1.5 text-sm text-white outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleRename}
                  className="w-full rounded-lg bg-primary py-1.5 text-xs font-medium text-white"
                >
                  Save
                </button>
              </div>
            ) : (
              actions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={action.onClick}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition hover:bg-white/10",
                    action.danger ? "text-red-400" : "text-white/90"
                  )}
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
