-- CreateTable
CREATE TABLE "EventDocumentRequirement" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "kind" "DocumentRequirementKind" NOT NULL DEFAULT 'CUSTOM',
    "customLabel" TEXT,
    "customDescription" TEXT,
    "partnerRequirementId" TEXT,

    CONSTRAINT "EventDocumentRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventDocumentRequirement_eventId_idx" ON "EventDocumentRequirement"("eventId");

-- AddForeignKey
ALTER TABLE "EventDocumentRequirement" ADD CONSTRAINT "EventDocumentRequirement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "PartnerEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDocumentRequirement" ADD CONSTRAINT "EventDocumentRequirement_partnerRequirementId_fkey" FOREIGN KEY ("partnerRequirementId") REFERENCES "PartnerDocumentRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
