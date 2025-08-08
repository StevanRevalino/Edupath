-- CreateTable
CREATE TABLE "public"."Universitas" (
    "university_id" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "npsn" INTEGER,
    "nama_singkat" TEXT,
    "kode_pos" INTEGER,
    "telepon" TEXT,
    "email" TEXT,
    "alamat" TEXT,
    "kota" TEXT,
    "provinsi" TEXT,
    "akreditasi" TEXT,
    "status" TEXT,
    "rank_qs" INTEGER,
    "rank_country" INTEGER,

    CONSTRAINT "Universitas_pkey" PRIMARY KEY ("university_id")
);
