-- CreateEnum
CREATE TYPE "public"."ConsultationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "public"."Consultation" (
    "consultation_id" TEXT NOT NULL,
    "murid_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "consultation_date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "public"."ConsultationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consultation_pkey" PRIMARY KEY ("consultation_id")
);

-- CreateIndex
CREATE INDEX "Consultation_murid_id_idx" ON "public"."Consultation"("murid_id");

-- CreateIndex
CREATE INDEX "Consultation_admin_id_idx" ON "public"."Consultation"("admin_id");

-- CreateIndex
CREATE INDEX "Consultation_status_idx" ON "public"."Consultation"("status");

-- CreateIndex
CREATE INDEX "Consultation_consultation_date_idx" ON "public"."Consultation"("consultation_date");

-- AddForeignKey
ALTER TABLE "public"."Consultation" ADD CONSTRAINT "Consultation_murid_id_fkey" FOREIGN KEY ("murid_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Consultation" ADD CONSTRAINT "Consultation_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
