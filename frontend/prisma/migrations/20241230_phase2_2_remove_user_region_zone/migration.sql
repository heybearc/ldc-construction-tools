-- Phase 2.2: Remove redundant regionId and zoneId from User model
-- Users will derive their CG from their linked Volunteer record

-- Step 1: For users with a volunteerId, sync their constructionGroupId from the volunteer
UPDATE "User" u
SET "constructionGroupId" = v."constructionGroupId"
FROM "volunteers" v
WHERE u."volunteerId" = v.id
  AND u."constructionGroupId" IS NULL;

-- Step 2: Drop the regionId and zoneId columns from User table
-- These are redundant since CG -> Region -> Zone relationship exists
ALTER TABLE "User" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "User" DROP COLUMN IF EXISTS "zoneId";

-- Step 3: Also remove regionId and zoneId from UserInvitation table
-- New users will get their CG from their volunteer link
ALTER TABLE "UserInvitation" DROP COLUMN IF EXISTS "regionId";
ALTER TABLE "UserInvitation" DROP COLUMN IF EXISTS "zoneId";

-- Note: constructionGroupId remains on User for the "break-glass" SUPER_ADMIN account
-- that doesn't have a linked volunteer
