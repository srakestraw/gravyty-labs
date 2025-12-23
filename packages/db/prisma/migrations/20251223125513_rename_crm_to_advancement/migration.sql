-- Rename CRM tables to Advancement terminology

-- Rename crm_contacts to crm_constituents
ALTER TABLE "crm_contacts" RENAME TO "crm_constituents";

-- Rename crm_accounts to crm_organizations  
ALTER TABLE "crm_accounts" RENAME TO "crm_organizations";

-- Rename crm_activities to crm_interactions
ALTER TABLE "crm_activities" RENAME TO "crm_interactions";

-- Update crm_opportunities: rename contactId to constituentId, accountId to organizationId
ALTER TABLE "crm_opportunities" RENAME COLUMN "contactId" TO "constituentId";
ALTER TABLE "crm_opportunities" RENAME COLUMN "accountId" TO "organizationId";

-- Update foreign key constraints for crm_opportunities
ALTER TABLE "crm_opportunities" DROP CONSTRAINT IF EXISTS "crm_opportunities_contactId_fkey";
ALTER TABLE "crm_opportunities" DROP CONSTRAINT IF EXISTS "crm_opportunities_accountId_fkey";

ALTER TABLE "crm_opportunities" 
  ADD CONSTRAINT "crm_opportunities_constituentId_fkey" 
  FOREIGN KEY ("constituentId") REFERENCES "crm_constituents"("id") ON DELETE CASCADE;

ALTER TABLE "crm_opportunities" 
  ADD CONSTRAINT "crm_opportunities_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "crm_organizations"("id") ON DELETE CASCADE;

-- Update foreign key constraints for crm_interactions
ALTER TABLE "crm_interactions" DROP CONSTRAINT IF EXISTS "crm_interactions_contactId_fkey";
ALTER TABLE "crm_interactions" DROP CONSTRAINT IF EXISTS "crm_interactions_accountId_fkey";

ALTER TABLE "crm_interactions" RENAME COLUMN "contactId" TO "constituentId";
ALTER TABLE "crm_interactions" RENAME COLUMN "accountId" TO "organizationId";

ALTER TABLE "crm_interactions" 
  ADD CONSTRAINT "crm_interactions_constituentId_fkey" 
  FOREIGN KEY ("constituentId") REFERENCES "crm_constituents"("id") ON DELETE CASCADE;

ALTER TABLE "crm_interactions" 
  ADD CONSTRAINT "crm_interactions_organizationId_fkey" 
  FOREIGN KEY ("organizationId") REFERENCES "crm_organizations"("id") ON DELETE CASCADE;

-- Update indexes
DROP INDEX IF EXISTS "crm_opportunities_contactId_idx";
DROP INDEX IF EXISTS "crm_opportunities_accountId_idx";
CREATE INDEX IF NOT EXISTS "crm_opportunities_constituentId_idx" ON "crm_opportunities"("constituentId");
CREATE INDEX IF NOT EXISTS "crm_opportunities_organizationId_idx" ON "crm_opportunities"("organizationId");

DROP INDEX IF EXISTS "crm_interactions_contactId_idx";
DROP INDEX IF EXISTS "crm_interactions_accountId_idx";
CREATE INDEX IF NOT EXISTS "crm_interactions_constituentId_idx" ON "crm_interactions"("constituentId");
CREATE INDEX IF NOT EXISTS "crm_interactions_organizationId_idx" ON "crm_interactions"("organizationId");
