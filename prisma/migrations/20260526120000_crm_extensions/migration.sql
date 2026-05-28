-- CreateEnum
CREATE TYPE "ActivityKind" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'MEETING', 'SYSTEM');

-- AlterTable
ALTER TABLE "EventProject" ADD COLUMN "winnerContactId" TEXT;

-- AlterTable
ALTER TABLE "EmailMessage" ADD COLUMN "toEmail" TEXT,
ADD COLUMN "dispatchAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "lastDispatchError" TEXT;

-- CreateTable
CREATE TABLE "ContactActivity" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "companyId" TEXT,
    "kind" "ActivityKind" NOT NULL DEFAULT 'NOTE',
    "body" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "meta" JSONB,

    CONSTRAINT "ContactActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorReview" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "projectId" TEXT,
    "hiTouchClientId" TEXT,
    "rating" INTEGER NOT NULL,
    "headline" TEXT,
    "body" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactActivity_contactId_occurredAt_idx" ON "ContactActivity"("contactId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "ContactActivity_companyId_occurredAt_idx" ON "ContactActivity"("companyId", "occurredAt" DESC);

-- CreateIndex
CREATE INDEX "VendorReview_contactId_createdAt_idx" ON "VendorReview"("contactId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "VendorReview_projectId_idx" ON "VendorReview"("projectId");

-- CreateIndex
CREATE INDEX "EventProject_winnerContactId_idx" ON "EventProject"("winnerContactId");

-- CreateIndex
CREATE INDEX "EmailMessage_sentAt_direction_idx" ON "EmailMessage"("sentAt", "direction");

-- AddForeignKey
ALTER TABLE "ContactActivity" ADD CONSTRAINT "ContactActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactActivity" ADD CONSTRAINT "ContactActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactActivity" ADD CONSTRAINT "ContactActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "EventProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_hiTouchClientId_fkey" FOREIGN KEY ("hiTouchClientId") REFERENCES "HiTouchClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorReview" ADD CONSTRAINT "VendorReview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventProject" ADD CONSTRAINT "EventProject_winnerContactId_fkey" FOREIGN KEY ("winnerContactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
