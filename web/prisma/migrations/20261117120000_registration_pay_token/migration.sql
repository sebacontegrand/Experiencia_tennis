-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "payToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Registration_payToken_key" ON "Registration"("payToken");

