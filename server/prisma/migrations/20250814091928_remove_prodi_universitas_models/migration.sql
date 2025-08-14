/*
  Warnings:

  - You are about to drop the `Prodi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProdiPT` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Universitas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ProdiPT" DROP CONSTRAINT "ProdiPT_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProdiPT" DROP CONSTRAINT "ProdiPT_university_id_fkey";

-- DropTable
DROP TABLE "public"."Prodi";

-- DropTable
DROP TABLE "public"."ProdiPT";

-- DropTable
DROP TABLE "public"."Universitas";
