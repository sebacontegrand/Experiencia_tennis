-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "installments" INTEGER,
ADD COLUMN     "paymentDeadline" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "paymentReminderSentAt" TIMESTAMP(3);

