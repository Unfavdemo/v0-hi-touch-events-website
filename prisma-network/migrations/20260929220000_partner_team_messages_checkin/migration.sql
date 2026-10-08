-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'VENDOR_ARRIVED';
ALTER TYPE "NotificationType" ADD VALUE 'VENDOR_WRAPPED';
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_ADDED';

-- CreateEnum
CREATE TYPE "PartnerMemberRole" AS ENUM ('OWNER', 'COORDINATOR');

-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN "vendorArrivedAt" TIMESTAMP(3);
ALTER TABLE "JobOpportunity" ADD COLUMN "vendorWrappedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PartnerMember" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "PartnerMemberRole" NOT NULL DEFAULT 'COORDINATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerMember_memberId_key" ON "PartnerMember"("memberId");
CREATE INDEX "PartnerMember_ownerId_idx" ON "PartnerMember"("ownerId");

ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "JobMessage" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JobMessage_jobId_createdAt_idx" ON "JobMessage"("jobId", "createdAt");
CREATE INDEX "JobMessage_senderId_idx" ON "JobMessage"("senderId");

ALTER TABLE "JobMessage" ADD CONSTRAINT "JobMessage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobMessage" ADD CONSTRAINT "JobMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
