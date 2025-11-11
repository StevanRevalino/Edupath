-- CreateEnum
CREATE TYPE "public"."ZoomStatus" AS ENUM ('scheduled', 'started', 'ended', 'cancelled');

-- CreateTable
CREATE TABLE "public"."Notification" (
    "notification_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "related_id" TEXT,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "public"."ZoomMeeting" (
    "zoom_meeting_id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "consultation_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "meeting_password" TEXT NOT NULL,
    "status" "public"."ZoomStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoomMeeting_pkey" PRIMARY KEY ("zoom_meeting_id")
);

-- CreateIndex
CREATE INDEX "Notification_user_id_idx" ON "public"."Notification"("user_id");

-- CreateIndex
CREATE INDEX "Notification_is_read_idx" ON "public"."Notification"("is_read");

-- CreateIndex
CREATE INDEX "Notification_created_at_idx" ON "public"."Notification"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ZoomMeeting_meeting_id_key" ON "public"."ZoomMeeting"("meeting_id");

-- CreateIndex
CREATE INDEX "ZoomMeeting_consultation_id_idx" ON "public"."ZoomMeeting"("consultation_id");

-- CreateIndex
CREATE INDEX "ZoomMeeting_host_id_idx" ON "public"."ZoomMeeting"("host_id");

-- CreateIndex
CREATE INDEX "ZoomMeeting_scheduled_time_idx" ON "public"."ZoomMeeting"("scheduled_time");

-- CreateIndex
CREATE INDEX "ZoomMeeting_status_idx" ON "public"."ZoomMeeting"("status");

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ZoomMeeting" ADD CONSTRAINT "ZoomMeeting_consultation_id_fkey" FOREIGN KEY ("consultation_id") REFERENCES "public"."Consultation"("consultation_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ZoomMeeting" ADD CONSTRAINT "ZoomMeeting_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
