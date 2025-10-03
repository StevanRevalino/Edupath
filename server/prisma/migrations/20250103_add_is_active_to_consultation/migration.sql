-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Consultation_is_active_idx" ON "Consultation"("is_active");
