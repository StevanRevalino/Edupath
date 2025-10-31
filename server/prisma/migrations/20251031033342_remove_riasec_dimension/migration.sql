/*
  Warnings:

  - You are about to drop the column `dimension` on the `RiasecQuestion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."RiasecQuestion_dimension_idx";

-- AlterTable
ALTER TABLE "public"."RiasecQuestion" DROP COLUMN "dimension";
