"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { DynamicBackground } from "@/components/background/DynamicBackground";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";
import { GalleryTabs } from "@/components/layout/GalleryTabs";
import { HeroSection } from "@/components/layout/HeroSection";
import { SearchFilters } from "@/components/search/SearchFilters";
import { FloatingUploadButton } from "@/components/upload/FloatingUploadButton";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { UploadSuccessToast } from "@/components/ui/UploadSuccessToast";
import { FullScreenViewer } from "@/components/viewer/FullScreenViewer";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { useMediaFetch } from "@/hooks/useMediaFetch";

export function MediaVaultDashboard() {
  const { isLoading } = useMediaFetch();
  const [headerUploadOpen, setHeaderUploadOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      <DynamicBackground />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <HeroSection onUploadClick={() => setHeaderUploadOpen(true)} />
        <GalleryTabs />
        <SearchFilters />

        <section className="mt-6">
          {isLoading ? <LoadingSkeleton /> : <MasonryGallery />}
        </section>
      </motion.main>

      <FloatingUploadButton />
      <UploadDropzone
        open={headerUploadOpen}
        onClose={() => setHeaderUploadOpen(false)}
        accept="both"
      />
      <UploadSuccessToast />
      <FullScreenViewer />
    </div>
  );
}
