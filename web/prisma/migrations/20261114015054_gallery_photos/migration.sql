-- AlterTable
ALTER TABLE "GalleryImage" ADD COLUMN     "height" INTEGER,
ADD COLUMN     "storageKey" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE INDEX "GalleryImage_experienceId_isPublic_sortOrder_idx" ON "GalleryImage"("experienceId", "isPublic", "sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_experienceId_isPublic_sortOrder_idx" ON "Testimonial"("experienceId", "isPublic", "sortOrder");
