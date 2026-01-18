-- Add volunteerId to User table (nullable for backwards compatibility)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "volunteerId" TEXT;

-- Add unique constraint only if it doesn't exist
DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_volunteerId_key" UNIQUE ("volunteerId");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add ldcRole as String (convert from enum, nullable)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ldcRole" TEXT;

-- Create VolunteerRoleCategory enum
DO $$ BEGIN
    CREATE TYPE "VolunteerRoleCategory" AS ENUM (
        'CG_OVERSIGHT',
        'CONSTRUCTION_STAFF',
        'TRADE_TEAM',
        'TRADE_CREW',
        'PROJECT_STAFF'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create volunteer_roles table
CREATE TABLE IF NOT EXISTS "volunteer_roles" (
    "id" TEXT NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "roleCategory" "VolunteerRoleCategory" NOT NULL,
    "roleName" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_roles_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on volunteer_roles
CREATE UNIQUE INDEX IF NOT EXISTS "volunteer_roles_volunteerId_roleCategory_roleName_entityId_key" 
    ON "volunteer_roles"("volunteerId", "roleCategory", "roleName", "entityId");

-- Create indexes on volunteer_roles
CREATE INDEX IF NOT EXISTS "volunteer_roles_volunteerId_idx" ON "volunteer_roles"("volunteerId");
CREATE INDEX IF NOT EXISTS "volunteer_roles_entityId_entityType_idx" ON "volunteer_roles"("entityId", "entityType");

-- Add foreign key from volunteer_roles to volunteers
ALTER TABLE "volunteer_roles" 
    ADD CONSTRAINT "volunteer_roles_volunteerId_fkey" 
    FOREIGN KEY ("volunteerId") 
    REFERENCES "volunteers"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;

-- Add foreign key from User to volunteers (if not exists)
DO $$ BEGIN
    ALTER TABLE "User" 
        ADD CONSTRAINT "User_volunteerId_fkey" 
        FOREIGN KEY ("volunteerId") 
        REFERENCES "volunteers"("id") 
        ON DELETE SET NULL 
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new UserRole enum values (if they don't exist)
DO $$ BEGIN
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ADMIN';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'USER';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ZONE_OVERSEER_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ZONE_OVERSEER_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONSTRUCTION_GROUP_OVERSEER_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'CONSTRUCTION_GROUP_OVERSEER_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRADE_TEAM_OVERSEER_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRADE_TEAM_OVERSEER_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRADE_CREW_OVERSEER';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRADE_CREW_OVERSEER_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'TRADE_CREW_OVERSEER_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PERSONNEL_CONTACT_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PERSONNEL_CONTACT_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FIELD_REP_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FIELD_REP_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DESIGN_CONTACT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DESIGN_CONTACT_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'DESIGN_CONTACT_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PROJECT_CONSTRUCTION_COORDINATOR';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PROJECT_CONSTRUCTION_COORDINATOR_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PROJECT_CONSTRUCTION_COORDINATOR_SUPPORT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SAFETY_COORDINATOR';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SAFETY_COORDINATOR_ASSISTANT';
    ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SAFETY_COORDINATOR_SUPPORT';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
