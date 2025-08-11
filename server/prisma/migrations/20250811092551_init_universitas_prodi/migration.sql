-- DropIndex
DROP INDEX "public"."Universitas_akreditasi_idx";

-- DropIndex
DROP INDEX "public"."Universitas_nama_idx";

-- DropIndex
DROP INDEX "public"."Universitas_provinsi_idx";

-- DropIndex
DROP INDEX "public"."Universitas_rank_country_idx";

-- DropIndex
DROP INDEX "public"."Universitas_rank_qs_idx";

-- AlterTable
ALTER TABLE "public"."Universitas" ALTER COLUMN "university_id" DROP DEFAULT,
ALTER COLUMN "npsn" SET DATA TYPE TEXT,
ALTER COLUMN "rank_qs" SET DATA TYPE DOUBLE PRECISION;
DROP SEQUENCE "universitas_university_id_seq";

-- CreateTable
CREATE TABLE "public"."Prodi" (
    "prodi_id" INTEGER NOT NULL,
    "nama_prodi" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "bidang" TEXT,
    "keywords" TEXT,

    CONSTRAINT "Prodi_pkey" PRIMARY KEY ("prodi_id")
);

-- CreateTable
CREATE TABLE "public"."ProdiPT" (
    "id" SERIAL NOT NULL,
    "prodi_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "akreditasi_prodi" TEXT,
    "ukt_min" INTEGER,
    "ukt_max" INTEGER,
    "link_prodi" TEXT,

    CONSTRAINT "ProdiPT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProdiPT_prodi_id_university_id_key" ON "public"."ProdiPT"("prodi_id", "university_id");

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."Prodi"("prodi_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."Universitas"("university_id") ON DELETE RESTRICT ON UPDATE CASCADE;
