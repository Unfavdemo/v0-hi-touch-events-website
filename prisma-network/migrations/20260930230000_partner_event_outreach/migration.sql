-- CreateEnum
CREATE TYPE "PartnerEventOutreachAudience" AS ENUM ('ALL_VENDORS', 'INVITED_ONLY');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_OUTREACH';
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_CLOSE_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'EVENT_DETAILS';

-- AlterTable
ALTER TABLE "PartnerEvent" ADD COLUMN "applicationCloseAt" TIMESTAMP(3),
ADD COLUMN "outreachAudience" "PartnerEventOutreachAudience" NOT NULL DEFAULT 'INVITED_ONLY',
ADD COLUMN "initialOutreachSentAt" TIMESTAMP(3),
ADD COLUMN "reminderTwoWeeksSentAt" TIMESTAMP(3),
ADD COLUMN "reminderOneWeekSentAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "PartnerEvent_applicationCloseAt_idx" ON "PartnerEvent"("applicationCloseAt");
