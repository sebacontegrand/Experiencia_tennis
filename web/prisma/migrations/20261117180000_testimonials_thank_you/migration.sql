-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "thankYouSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Testimonial" ADD COLUMN     "registrationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Testimonial_registrationId_key" ON "Testimonial"("registrationId");

-- AddForeignKey
ALTER TABLE "Testimonial" ADD CONSTRAINT "Testimonial_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE SET NULL ON UPDATE CASCADE;

