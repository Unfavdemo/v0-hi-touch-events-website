-- AlterEnum
ALTER TYPE "VendorDocumentKind" ADD VALUE 'PORTFOLIO';

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "defaultRate" DECIMAL(10,2),
ADD COLUMN     "travelRadiusMiles" INTEGER,
ADD COLUMN     "crewSize" INTEGER,
ADD COLUMN     "equipmentNotes" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
ADD COLUMN     "emergencyContact" TEXT,
ADD COLUMN     "notificationPrefs" JSONB;

-- CreateTable
CREATE TABLE "VendorBlackout" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorBlackout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorCrewMember" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorCrewMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobCrewAssignment" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "crewMemberId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobCrewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorBlackout_vendorId_startAt_idx" ON "VendorBlackout"("vendorId", "startAt");

-- CreateIndex
CREATE INDEX "VendorCrewMember_vendorId_idx" ON "VendorCrewMember"("vendorId");

-- CreateIndex
CREATE INDEX "JobCrewAssignment_jobId_idx" ON "JobCrewAssignment"("jobId");

-- CreateIndex
CREATE INDEX "JobCrewAssignment_vendorId_idx" ON "JobCrewAssignment"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "JobCrewAssignment_jobId_crewMemberId_key" ON "JobCrewAssignment"("jobId", "crewMemberId");

-- AddForeignKey
ALTER TABLE "VendorBlackout" ADD CONSTRAINT "VendorBlackout_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorCrewMember" ADD CONSTRAINT "VendorCrewMember_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCrewAssignment" ADD CONSTRAINT "JobCrewAssignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobCrewAssignment" ADD CONSTRAINT "JobCrewAssignment_crewMemberId_fkey" FOREIGN KEY ("crewMemberId") REFERENCES "VendorCrewMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
