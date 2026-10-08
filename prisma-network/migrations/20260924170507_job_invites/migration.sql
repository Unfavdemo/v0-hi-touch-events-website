-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'APPLIED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InviteSource" AS ENUM ('ALGORITHM', 'PARTNER');

-- CreateTable
CREATE TABLE "JobInvite" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "source" "InviteSource" NOT NULL DEFAULT 'ALGORITHM',
    "matchScore" DOUBLE PRECISION NOT NULL,
    "matchReasons" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "JobInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JobInvite_freelancerId_status_idx" ON "JobInvite"("freelancerId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JobInvite_jobId_freelancerId_key" ON "JobInvite"("jobId", "freelancerId");

-- AddForeignKey
ALTER TABLE "JobInvite" ADD CONSTRAINT "JobInvite_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobInvite" ADD CONSTRAINT "JobInvite_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
