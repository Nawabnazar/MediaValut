"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends HTMLMotionProps<"div"> {
  strong?: boolean;
}

export function GlassPanel({
  className,
  strong,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "rounded-[24px] shadow-xl shadow-primary/5",
        strong ? "glass-strong" : "glass",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
