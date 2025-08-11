-- AlterTable
CREATE SEQUENCE "public".universitas_university_id_seq;
ALTER TABLE "public"."Universitas" ADD COLUMN     "fax" TEXT,
ALTER COLUMN "university_id" SET DEFAULT nextval('"public".universitas_university_id_seq'),
ALTER COLUMN "npsn" DROP NOT NULL,
ALTER COLUMN "npsn" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "kode_pos" DROP NOT NULL,
ALTER COLUMN "kode_pos" SET DATA TYPE TEXT,
ALTER COLUMN "telepon" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "alamat" DROP NOT NULL,
ALTER COLUMN "kota" DROP NOT NULL,
ALTER COLUMN "provinsi" DROP NOT NULL,
ALTER COLUMN "akreditasi" DROP NOT NULL,
ALTER COLUMN "status" DROP NOT NULL;
ALTER SEQUENCE "public".universitas_university_id_seq OWNED BY "public"."Universitas"."university_id";

-- CreateIndex
CREATE INDEX "Universitas_nama_idx" ON "public"."Universitas"("nama");

-- CreateIndex
CREATE INDEX "Universitas_provinsi_idx" ON "public"."Universitas"("provinsi");

-- CreateIndex
CREATE INDEX "Universitas_akreditasi_idx" ON "public"."Universitas"("akreditasi");

-- CreateIndex
CREATE INDEX "Universitas_rank_qs_idx" ON "public"."Universitas"("rank_qs");

-- CreateIndex
CREATE INDEX "Universitas_rank_country_idx" ON "public"."Universitas"("rank_country");
