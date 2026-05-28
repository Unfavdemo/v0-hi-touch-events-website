-- AdminRole: ADMIN -> COORDINATOR
ALTER TYPE "AdminRole" RENAME VALUE 'ADMIN' TO 'COORDINATOR';

-- PortalKind enum
CREATE TYPE "PortalKind" AS ENUM ('CLIENT', 'VENDOR');

-- PortalAccount
CREATE TABLE "PortalAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "kind" "PortalKind" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "invitedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PortalAccount_userId_key" ON "PortalAccount"("userId");
CREATE UNIQUE INDEX "PortalAccount_contactId_key" ON "PortalAccount"("contactId");
CREATE INDEX "PortalAccount_kind_enabled_idx" ON "PortalAccount"("kind", "enabled");

ALTER TABLE "PortalAccount" ADD CONSTRAINT "PortalAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PortalAccount" ADD CONSTRAINT "PortalAccount_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default for new AdminUser rows
ALTER TABLE "AdminUser" ALTER COLUMN "role" SET DEFAULT 'COORDINATOR';
