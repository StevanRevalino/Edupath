-- AlterTable: Rename 'notes' column to 'description' and add 'admin_notes' column
ALTER TABLE "Consultation" RENAME COLUMN "notes" TO "description";

-- AlterTable: Add admin_notes column
ALTER TABLE "Consultation" ADD COLUMN "admin_notes" TEXT;
