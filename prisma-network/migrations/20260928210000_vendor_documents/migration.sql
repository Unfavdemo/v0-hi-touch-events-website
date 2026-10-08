-- CreateEnum
CREATE TYPE "VendorDocumentKind" AS ENUM ('W9', 'COI', 'OTHER');

-- CreateTable
CREATE TABLE "VendorDocument" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "kind" "VendorDocumentKind" NOT NULL,
    "label" TEXT NOT NULL,
    "storedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VendorDocument_vendorId_kind_idx" ON "VendorDocument"("vendorId", "kind");

-- AddForeignKey
ALTER TABLE "VendorDocument" ADD CONSTRAINT "VendorDocument_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy existing W-9 paths onto document records
INSERT INTO "VendorDocument" ("id", "vendorId", "kind", "label", "storedKey", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "userId", 'W9', 'Form W-9', "w9Url", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Profile"
WHERE "w9Url" IS NOT NULL AND "w9Url" <> '';
