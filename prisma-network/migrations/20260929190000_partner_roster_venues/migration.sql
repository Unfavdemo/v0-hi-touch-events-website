-- CreateTable
CREATE TABLE "PartnerVendor" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerVendor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PartnerVendor_partnerId_vendorId_key" ON "PartnerVendor"("partnerId", "vendorId");
CREATE INDEX "PartnerVendor_partnerId_blocked_idx" ON "PartnerVendor"("partnerId", "blocked");

ALTER TABLE "PartnerVendor" ADD CONSTRAINT "PartnerVendor_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PartnerVendor" ADD CONSTRAINT "PartnerVendor_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "SavedVenue" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedVenue_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SavedVenue_partnerId_idx" ON "SavedVenue"("partnerId");

ALTER TABLE "SavedVenue" ADD CONSTRAINT "SavedVenue_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
