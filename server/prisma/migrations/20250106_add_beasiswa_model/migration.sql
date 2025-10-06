-- CreateTable
CREATE TABLE "Beasiswa" (
    "beasiswa_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beasiswa_pkey" PRIMARY KEY ("beasiswa_id")
);

-- CreateIndex
CREATE INDEX "Beasiswa_created_at_idx" ON "Beasiswa"("created_at");
