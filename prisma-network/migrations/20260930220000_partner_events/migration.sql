-- CreateTable
CREATE TABLE "PartnerEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "partnerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerEvent_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN "partnerEventId" TEXT;

-- CreateIndex
CREATE INDEX "PartnerEvent_partnerId_idx" ON "PartnerEvent"("partnerId");

-- CreateIndex
CREATE INDEX "JobOpportunity_partnerEventId_idx" ON "JobOpportunity"("partnerEventId");

-- AddForeignKey
ALTER TABLE "PartnerEvent" ADD CONSTRAINT "PartnerEvent_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobOpportunity" ADD CONSTRAINT "JobOpportunity_partnerEventId_fkey" FOREIGN KEY ("partnerEventId") REFERENCES "PartnerEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
