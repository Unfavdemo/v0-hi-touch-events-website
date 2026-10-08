DO $$ BEGIN
  CREATE TYPE "AdminScope" AS ENUM ('SUPER', 'EVENT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "adminScope" "AdminScope";

UPDATE "User" SET "adminScope" = 'SUPER' WHERE "role" = 'ADMIN' AND "adminScope" IS NULL;

CREATE TABLE IF NOT EXISTS "EventDelegation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "delegatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventDelegation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EventDelegation_jobId_adminId_key" ON "EventDelegation"("jobId", "adminId");
CREATE INDEX IF NOT EXISTS "EventDelegation_adminId_idx" ON "EventDelegation"("adminId");

DO $$ BEGIN
  ALTER TABLE "EventDelegation" ADD CONSTRAINT "EventDelegation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventDelegation" ADD CONSTRAINT "EventDelegation_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "EventDelegation" ADD CONSTRAINT "EventDelegation_delegatedById_fkey" FOREIGN KEY ("delegatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
