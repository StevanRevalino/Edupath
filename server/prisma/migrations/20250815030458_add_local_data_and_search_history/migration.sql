-- CreateEnum
CREATE TYPE "public"."SearchType" AS ENUM ('PRODI', 'UNIVERSITAS');

-- CreateTable
CREATE TABLE "public"."SearchHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "query" TEXT NOT NULL,
    "type" "public"."SearchType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LocalUniversitas" (
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

    CONSTRAINT "LocalUniversitas_pkey" PRIMARY KEY ("university_id")
);

-- CreateTable
CREATE TABLE "public"."LocalProdi" (
    "prodi_id" INTEGER NOT NULL,
    "nama_prodi" TEXT NOT NULL,
    "jenjang" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalProdi_pkey" PRIMARY KEY ("prodi_id")
);

-- CreateTable
CREATE TABLE "public"."LocalProdiPT" (
    "id" SERIAL NOT NULL,
    "prodi_id" INTEGER NOT NULL,
    "university_id" INTEGER NOT NULL,
    "akreditasi_prodi" TEXT,
    "ukt_min" TEXT,
    "ukt_max" TEXT,
    "link_prodi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalProdiPT_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchHistory_user_id_type_created_at_idx" ON "public"."SearchHistory"("user_id", "type", "created_at");

-- CreateIndex
CREATE INDEX "LocalUniversitas_nama_idx" ON "public"."LocalUniversitas"("nama");

-- CreateIndex
CREATE INDEX "LocalUniversitas_provinsi_idx" ON "public"."LocalUniversitas"("provinsi");

-- CreateIndex
CREATE INDEX "LocalUniversitas_kota_idx" ON "public"."LocalUniversitas"("kota");

-- CreateIndex
CREATE INDEX "LocalProdi_nama_prodi_idx" ON "public"."LocalProdi"("nama_prodi");

-- CreateIndex
CREATE INDEX "LocalProdi_jenjang_idx" ON "public"."LocalProdi"("jenjang");

-- CreateIndex
CREATE INDEX "LocalProdiPT_prodi_id_idx" ON "public"."LocalProdiPT"("prodi_id");

-- CreateIndex
CREATE INDEX "LocalProdiPT_university_id_idx" ON "public"."LocalProdiPT"("university_id");

-- CreateIndex
CREATE UNIQUE INDEX "LocalProdiPT_prodi_id_university_id_key" ON "public"."LocalProdiPT"("prodi_id", "university_id");

-- AddForeignKey
ALTER TABLE "public"."SearchHistory" ADD CONSTRAINT "SearchHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocalProdiPT" ADD CONSTRAINT "LocalProdiPT_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."LocalProdi"("prodi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocalProdiPT" ADD CONSTRAINT "LocalProdiPT_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."LocalUniversitas"("university_id") ON DELETE CASCADE ON UPDATE CASCADE;
