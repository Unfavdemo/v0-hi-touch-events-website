-- CreateEnum
CREATE TYPE "DocumentRequirementKind" AS ENUM ('W9', 'VENDOR_AGREEMENT', 'HITOUCH_COI', 'CUSTOM');

-- CreateTable
CREATE TABLE "PartnerDocumentRequirement" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartnerDocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDocumentRequirement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" "DocumentRequirementKind" NOT NULL,
    "customLabel" TEXT,
    "partnerRequirementId" TEXT,

    CONSTRAINT "JobDocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PartnerDocumentRequirement_partnerId_idx" ON "PartnerDocumentRequirement"("partnerId");

-- CreateIndex
CREATE INDEX "JobDocumentRequirement_jobId_idx" ON "JobDocumentRequirement"("jobId");

-- AddForeignKey
ALTER TABLE "PartnerDocumentRequirement" ADD CONSTRAINT "PartnerDocumentRequirement_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDocumentRequirement" ADD CONSTRAINT "JobDocumentRequirement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDocumentRequirement" ADD CONSTRAINT "JobDocumentRequirement_partnerRequirementId_fkey" FOREIGN KEY ("partnerRequirementId") REFERENCES "PartnerDocumentRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
