-- CreateEnum
CREATE TYPE "VendorPayMethod" AS ENUM ('CHECK', 'ACH', 'CARD', 'CASH', 'OTHER');

-- AlterTable
ALTER TABLE "JobOpportunity" ADD COLUMN "vendorPaidAt" TIMESTAMP(3),
ADD COLUMN "vendorPayMethod" "VendorPayMethod",
ADD COLUMN "vendorPaidAmount" DECIMAL(10,2),
ADD COLUMN "vendorPayNote" TEXT;
