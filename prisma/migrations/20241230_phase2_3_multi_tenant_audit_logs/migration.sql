-- Phase 2.3: Multi-Tenant Audit Logging
-- Add multi-tenant fields to audit_logs table

-- Add new columns for multi-tenant tracking
ALTER TABLE "audit_logs" ADD COLUMN "fromConstructionGroupId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "toConstructionGroupId" TEXT;
ALTER TABLE "audit_logs" ADD COLUMN "metadata" JSONB;

-- Add foreign key constraints
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_fromConstructionGroupId_fkey" 
  FOREIGN KEY ("fromConstructionGroupId") REFERENCES "construction_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_toConstructionGroupId_fkey" 
  FOREIGN KEY ("toConstructionGroupId") REFERENCES "construction_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");
CREATE INDEX "audit_logs_action_timestamp_idx" ON "audit_logs"("action", "timestamp");
CREATE INDEX "audit_logs_resource_resourceId_idx" ON "audit_logs"("resource", "resourceId");
CREATE INDEX "audit_logs_fromConstructionGroupId_toConstructionGroupId_idx" ON "audit_logs"("fromConstructionGroupId", "toConstructionGroupId");
