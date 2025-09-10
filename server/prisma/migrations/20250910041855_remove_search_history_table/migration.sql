/*
  Warnings:

  - You are about to drop the `SearchHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."SearchHistory" DROP CONSTRAINT "SearchHistory_user_id_fkey";

-- DropTable
DROP TABLE "public"."SearchHistory";

-- DropEnum
DROP TYPE "public"."SearchType";
