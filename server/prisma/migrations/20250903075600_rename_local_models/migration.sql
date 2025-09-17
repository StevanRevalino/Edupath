/*
  Warnings:

  - You are about to drop the `LocalProdi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocalProdiPT` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LocalUniversitas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."LocalProdiPT" DROP CONSTRAINT "LocalProdiPT_prodi_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."LocalProdiPT" DROP CONSTRAINT "LocalProdiPT_university_id_fkey";

-- DropTable
DROP TABLE "public"."LocalProdi";

-- DropTable
DROP TABLE "public"."LocalProdiPT";

-- DropTable
DROP TABLE "public"."LocalUniversitas";

-- CreateTable
CREATE TABLE "public"."Universitas" (
    "university_id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "npsn" TEXT,
    "nama_singkat" TEXT,
    "kode_pos" TEXT,
    "telepon" TEXT,
    "fax" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "akreditasi" TEXT,
    "status" TEXT,
    "rank_qs" TEXT,
    "rank_country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Universitas_pkey" PRIMARY KEY ("university_id")
);

-- CreateTable
CREATE TABLE "public"."Prodi" (
    "prodi_id" INTEGER NOT NULL,
    "nama_prodi" TEXT NOT NULL,
    "jenjang" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("prodi_id")
);

-- CreateTable
CREATE TABLE "public"."ProdiPT" (
    "id" SERIAL NOT NULL,
    "prodi_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "akreditasi_prodi" TEXT,
    "ukt_min" TEXT,
    "ukt_max" TEXT,
    "link_prodi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProdiPT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Universitas_nama_idx" ON "public"."Universitas"("nama");

-- CreateIndex
CREATE INDEX "Universitas_provinsi_idx" ON "public"."Universitas"("provinsi");

-- CreateIndex
CREATE INDEX "Universitas_kota_idx" ON "public"."Universitas"("kota");

-- CreateIndex
CREATE INDEX "Prodi_nama_prodi_idx" ON "public"."Prodi"("nama_prodi");

-- CreateIndex
CREATE INDEX "Prodi_jenjang_idx" ON "public"."Prodi"("jenjang");

-- CreateIndex
CREATE INDEX "ProdiPT_prodi_id_idx" ON "public"."ProdiPT"("prodi_id");

-- CreateIndex
CREATE INDEX "ProdiPT_university_id_idx" ON "public"."ProdiPT"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProdiPT_prodi_id_university_id_key" ON "public"."ProdiPT"("prodi_id", "university_id");

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."Prodi"("prodi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."Universitas"("university_id") ON DELETE CASCADE ON UPDATE CASCADE;
