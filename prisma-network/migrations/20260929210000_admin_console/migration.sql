-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ANNOUNCEMENT';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN "adminNotes" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN "hiddenAt" TIMESTAMP(3);
ALTER TABLE "Review" ADD COLUMN "hiddenById" TEXT;

-- AlterTable
ALTER TABLE "VendorDocument" ADD COLUMN "expiresAt" TIMESTAMP(3);

-- CreateEnum
CREATE TYPE "IncidentKind" AS ENUM ('NO_SHOW', 'COMPLAINT', 'DAMAGE', 'OTHER');

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "jobId" TEXT,
    "vendorId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "kind" "IncidentKind" NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Incident_vendorId_idx" ON "Incident"("vendorId");
CREATE INDEX "Incident_jobId_idx" ON "Incident"("jobId");

ALTER TABLE "Incident" ADD CONSTRAINT "Incident_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminAction_createdAt_idx" ON "AdminAction"("createdAt");
CREATE INDEX "AdminAction_actorId_idx" ON "AdminAction"("actorId");

ALTER TABLE "AdminAction" ADD CONSTRAINT "AdminAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Review" ADD CONSTRAINT "Review_hiddenById_fkey" FOREIGN KEY ("hiddenById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "warningThreshold" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "dismissalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "inviteTarget" INTEGER NOT NULL DEFAULT 5,
    "sendMoreExtra" INTEGER NOT NULL DEFAULT 3,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "PlatformSettings" ("id", "warningThreshold", "dismissalThreshold", "inviteTarget", "sendMoreExtra", "updatedAt")
VALUES ('default', 3.5, 3.0, 5, 3, CURRENT_TIMESTAMP);
