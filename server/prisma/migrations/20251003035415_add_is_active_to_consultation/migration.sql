-- AlterTable
ALTER TABLE "public"."Consultation" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Consultation_is_active_idx" ON "public"."Consultation"("is_active");
