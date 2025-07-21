/*
  Warnings:

  - You are about to drop the column `kelas` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "kelas",
ADD COLUMN     "otpExpires" TIMESTAMP(3);
