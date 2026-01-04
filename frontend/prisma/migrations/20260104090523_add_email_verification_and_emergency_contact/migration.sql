-- AlterTable
ALTER TABLE "volunteers" ADD COLUMN     "emailPersonalVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailJwVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailPersonalBounced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailJwBounced" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastEmailVerified" TIMESTAMP(3),
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "emergencyContactRelationship" TEXT;
