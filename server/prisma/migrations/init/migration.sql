-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'STUDENT');

-- CreateEnum
CREATE TYPE "public"."ConsultationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RiasecType" AS ENUM ('REALISTIC', 'INVESTIGATIVE', 'ARTISTIC', 'SOCIAL', 'ENTERPRISING', 'CONVENTIONAL');

-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'STUDENT',
    "kelas" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

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

-- CreateTable
CREATE TABLE "public"."Consultation" (
    "consultation_id" TEXT NOT NULL,
    "murid_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "consultation_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "admin_notes" TEXT,
    "status" "public"."ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("consultation_id")
);

-- CreateTable
CREATE TABLE "public"."ChatRoom" (
    "room_id" TEXT NOT NULL,
    "consultation_id" TEXT NOT NULL,
    "murid_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "message_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "public"."Beasiswa" (
    "beasiswa_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beasiswa_pkey" PRIMARY KEY ("beasiswa_id")
);

-- CreateTable
CREATE TABLE "public"."RiasecQuestion" (
    "question_id" SERIAL NOT NULL,
    "question_text" TEXT NOT NULL,
    "riasec_type" "public"."RiasecType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiasecQuestion_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "public"."RiasecAssessment" (
    "assessment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "realistic_score" INTEGER NOT NULL DEFAULT 0,
    "investigative_score" INTEGER NOT NULL DEFAULT 0,
    "artistic_score" INTEGER NOT NULL DEFAULT 0,
    "social_score" INTEGER NOT NULL DEFAULT 0,
    "enterprising_score" INTEGER NOT NULL DEFAULT 0,
    "conventional_score" INTEGER NOT NULL DEFAULT 0,
    "primary_type" "public"."RiasecType" NOT NULL,
    "secondary_type" "public"."RiasecType",
    "holland_code" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiasecAssessment_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "public"."RiasecResponse" (
    "response_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "question_id" INTEGER NOT NULL,
    "answer_value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiasecResponse_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "public"."RiasecProdiMapping" (
    "mapping_id" SERIAL NOT NULL,
    "prodi_id" INTEGER NOT NULL,
    "primary_type" "public"."RiasecType" NOT NULL,
    "secondary_type" "public"."RiasecType",
    "compatibility_score" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiasecProdiMapping_pkey" PRIMARY KEY ("mapping_id")
);

-- CreateTable
CREATE TABLE "public"."RiasecRecommendation" (
    "recommendation_id" TEXT NOT NULL,
    "assessment_id" TEXT NOT NULL,
    "prodi_id" INTEGER NOT NULL,
    "match_percentage" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiasecRecommendation_pkey" PRIMARY KEY ("recommendation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

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

-- CreateIndex
CREATE INDEX "Consultation_murid_id_idx" ON "public"."Consultation"("murid_id");

-- CreateIndex
CREATE INDEX "Consultation_admin_id_idx" ON "public"."Consultation"("admin_id");

-- CreateIndex
CREATE INDEX "Consultation_status_idx" ON "public"."Consultation"("status");

-- CreateIndex
CREATE INDEX "Consultation_consultation_date_idx" ON "public"."Consultation"("consultation_date");

-- CreateIndex
CREATE INDEX "Consultation_is_active_idx" ON "public"."Consultation"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_consultation_id_key" ON "public"."ChatRoom"("consultation_id");

-- CreateIndex
CREATE INDEX "ChatRoom_murid_id_idx" ON "public"."ChatRoom"("murid_id");

-- CreateIndex
CREATE INDEX "ChatRoom_admin_id_idx" ON "public"."ChatRoom"("admin_id");

-- CreateIndex
CREATE INDEX "ChatRoom_is_active_idx" ON "public"."ChatRoom"("is_active");

-- CreateIndex
CREATE INDEX "ChatMessage_room_id_idx" ON "public"."ChatMessage"("room_id");

-- CreateIndex
CREATE INDEX "ChatMessage_sender_id_idx" ON "public"."ChatMessage"("sender_id");

-- CreateIndex
CREATE INDEX "ChatMessage_created_at_idx" ON "public"."ChatMessage"("created_at");

-- CreateIndex
CREATE INDEX "Beasiswa_created_at_idx" ON "public"."Beasiswa"("created_at");

-- CreateIndex
CREATE INDEX "RiasecQuestion_riasec_type_idx" ON "public"."RiasecQuestion"("riasec_type");

-- CreateIndex
CREATE INDEX "RiasecAssessment_user_id_idx" ON "public"."RiasecAssessment"("user_id");

-- CreateIndex
CREATE INDEX "RiasecAssessment_primary_type_idx" ON "public"."RiasecAssessment"("primary_type");

-- CreateIndex
CREATE INDEX "RiasecAssessment_completed_at_idx" ON "public"."RiasecAssessment"("completed_at");

-- CreateIndex
CREATE INDEX "RiasecResponse_assessment_id_idx" ON "public"."RiasecResponse"("assessment_id");

-- CreateIndex
CREATE INDEX "RiasecResponse_question_id_idx" ON "public"."RiasecResponse"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "RiasecResponse_assessment_id_question_id_key" ON "public"."RiasecResponse"("assessment_id", "question_id");

-- CreateIndex
CREATE INDEX "RiasecProdiMapping_primary_type_idx" ON "public"."RiasecProdiMapping"("primary_type");

-- CreateIndex
CREATE INDEX "RiasecProdiMapping_secondary_type_idx" ON "public"."RiasecProdiMapping"("secondary_type");

-- CreateIndex
CREATE INDEX "RiasecProdiMapping_prodi_id_idx" ON "public"."RiasecProdiMapping"("prodi_id");

-- CreateIndex
CREATE INDEX "RiasecRecommendation_assessment_id_idx" ON "public"."RiasecRecommendation"("assessment_id");

-- CreateIndex
CREATE INDEX "RiasecRecommendation_prodi_id_idx" ON "public"."RiasecRecommendation"("prodi_id");

-- CreateIndex
CREATE INDEX "RiasecRecommendation_rank_idx" ON "public"."RiasecRecommendation"("rank");

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."Prodi"("prodi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProdiPT" ADD CONSTRAINT "ProdiPT_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."Universitas"("university_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consultation" ADD CONSTRAINT "Consultation_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consultation" ADD CONSTRAINT "Consultation_murid_id_fkey" FOREIGN KEY ("murid_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."Consultation"("consultation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_murid_id_fkey" FOREIGN KEY ("murid_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecAssessment" ADD CONSTRAINT "RiasecAssessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecResponse" ADD CONSTRAINT "RiasecResponse_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."RiasecAssessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecResponse" ADD CONSTRAINT "RiasecResponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "public"."RiasecQuestion"("question_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecProdiMapping" ADD CONSTRAINT "RiasecProdiMapping_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."Prodi"("prodi_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecRecommendation" ADD CONSTRAINT "RiasecRecommendation_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "public"."RiasecAssessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RiasecRecommendation" ADD CONSTRAINT "RiasecRecommendation_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "public"."Prodi"("prodi_id") ON DELETE CASCADE ON UPDATE CASCADE;

