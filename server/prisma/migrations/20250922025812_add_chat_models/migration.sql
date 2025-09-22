-- AlterEnum
ALTER TYPE "public"."ConsultationStatus" ADD VALUE 'COMPLETED';

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

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."Consultation"("consultation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_murid_id_fkey" FOREIGN KEY ("murid_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatRoom" ADD CONSTRAINT "ChatRoom_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."ChatRoom"("room_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
