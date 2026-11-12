-- CreateEnum
CREATE TYPE "CostKind" AS ENUM ('TOTAL', 'PER_PERSON');

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "earningsPercent" INTEGER,
ADD COLUMN     "expectedAttendance" INTEGER;

-- AlterTable
ALTER TABLE "PriceOption" ADD COLUMN     "cost" INTEGER;

-- CreateTable
CREATE TABLE "CostItem" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "kind" "CostKind" NOT NULL DEFAULT 'TOTAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "experienceId" TEXT NOT NULL,

    CONSTRAINT "CostItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CostItem_experienceId_idx" ON "CostItem"("experienceId");

-- AddForeignKey
ALTER TABLE "CostItem" ADD CONSTRAINT "CostItem_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
