-- CreateEnum
CREATE TYPE "ExperienceAudience" AS ENUM ('MUJERES', 'MIXTO');

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "audience" "ExperienceAudience";
