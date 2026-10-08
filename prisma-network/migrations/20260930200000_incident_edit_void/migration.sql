-- AlterTable
ALTER TABLE "Incident" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Incident" ADD COLUMN "voidedAt" TIMESTAMP(3);
ALTER TABLE "Incident" ADD COLUMN "voidedById" TEXT;

CREATE INDEX "Incident_voidedAt_idx" ON "Incident"("voidedAt");

ALTER TABLE "Incident" ADD CONSTRAINT "Incident_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
