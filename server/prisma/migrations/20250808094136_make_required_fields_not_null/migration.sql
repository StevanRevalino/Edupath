/*
  Warnings:

  - Made the column `npsn` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kode_pos` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telepon` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `alamat` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `kota` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `provinsi` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `akreditasi` on table `Universitas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `Universitas` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Universitas" ALTER COLUMN "npsn" SET NOT NULL,
ALTER COLUMN "kode_pos" SET NOT NULL,
ALTER COLUMN "telepon" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "alamat" SET NOT NULL,
ALTER COLUMN "kota" SET NOT NULL,
ALTER COLUMN "provinsi" SET NOT NULL,
ALTER COLUMN "akreditasi" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL;
