-- Split public review copy from staff-only notes; optional display name for Google-style cards
ALTER TABLE "VendorReview" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "VendorReview" ADD COLUMN "reviewerName" TEXT;
