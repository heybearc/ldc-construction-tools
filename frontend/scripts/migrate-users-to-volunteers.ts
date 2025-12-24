/**
 * Data Migration Script: Create Volunteers from Existing Users
 * 
 * This script:
 * 1. Finds all existing Users without a linked Volunteer
 * 2. Creates a Volunteer record for each User
 * 3. Links the User to the Volunteer via User.volunteerId
 * 4. Migrates User.ldcRole to VolunteerRole if present
 * 
 * Safe to run multiple times (idempotent)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Role mapping: User.ldcRole string -> VolunteerRole
const ROLE_MAPPING: Record<string, { category: string; name: string; code: string }> = {
  // CG Oversight roles
  'CONSTRUCTION_GROUP_OVERSEER': { category: 'CG_OVERSIGHT', name: 'Construction Group Overseer (CGO)', code: 'CGO' },
  'CONSTRUCTION_GROUP_OVERSEER_ASSISTANT': { category: 'CG_OVERSIGHT', name: 'Assistant Construction Group Overseer (ACGO)', code: 'ACGO' },
  'CONSTRUCTION_GROUP_OVERSEER_SUPPORT': { category: 'CG_OVERSIGHT', name: 'Construction Group Support (CG Support)', code: 'CG_SUPPORT' },
  
  // Construction Staff roles
  'PERSONNEL_CONTACT': { category: 'CONSTRUCTION_STAFF', name: 'Personnel Contact (PC)', code: 'PC' },
  'PERSONNEL_CONTACT_ASSISTANT': { category: 'CONSTRUCTION_STAFF', name: 'Personnel Contact Assistant (PCA)', code: 'PCA' },
  'PERSONNEL_CONTACT_SUPPORT': { category: 'CONSTRUCTION_STAFF', name: 'Personnel Support (PC Support)', code: 'PC_SUPPORT' },
  'FIELD_REP': { category: 'CONSTRUCTION_STAFF', name: 'Field Representative (FR)', code: 'FR' },
  'FIELD_REP_ASSISTANT': { category: 'CONSTRUCTION_STAFF', name: 'Field Representative Assistant (FRA)', code: 'FRA' },
  'FIELD_REP_SUPPORT': { category: 'CONSTRUCTION_STAFF', name: 'Field Representative Support (FR Support)', code: 'FR_SUPPORT' },
  'DESIGN_CONTACT': { category: 'CONSTRUCTION_STAFF', name: 'Design Contact (DC)', code: 'DC' },
  'DESIGN_CONTACT_ASSISTANT': { category: 'CONSTRUCTION_STAFF', name: 'Design Contact Assistant (DCA)', code: 'DCA' },
  'DESIGN_CONTACT_SUPPORT': { category: 'CONSTRUCTION_STAFF', name: 'Design Contact Support (DC Support)', code: 'DC_SUPPORT' },
  'PROJECT_CONSTRUCTION_COORDINATOR': { category: 'CONSTRUCTION_STAFF', name: 'Project Construction Coordinator (PCC)', code: 'PCC' },
  'PROJECT_CONSTRUCTION_COORDINATOR_ASSISTANT': { category: 'CONSTRUCTION_STAFF', name: 'Project Construction Coordinator Assistant (PCC Assistant)', code: 'PCC_ASSISTANT' },
  'PROJECT_CONSTRUCTION_COORDINATOR_SUPPORT': { category: 'CONSTRUCTION_STAFF', name: 'Project Construction Coordinator Support (PCC Support)', code: 'PCC_SUPPORT' },
  'SAFETY_COORDINATOR': { category: 'CONSTRUCTION_STAFF', name: 'Safety Coordinator (SC)', code: 'SC' },
  'SAFETY_COORDINATOR_ASSISTANT': { category: 'CONSTRUCTION_STAFF', name: 'Safety Coordinator Assistant (SCA)', code: 'SCA' },
  'SAFETY_COORDINATOR_SUPPORT': { category: 'CONSTRUCTION_STAFF', name: 'Safety Coordinator Support (SC Support)', code: 'SC_SUPPORT' },
  
  // Trade Team roles
  'TRADE_TEAM_OVERSEER': { category: 'TRADE_TEAM', name: 'Trade Team Overseer (TTO)', code: 'TTO' },
  'TRADE_TEAM_OVERSEER_ASSISTANT': { category: 'TRADE_TEAM', name: 'Trade Team Overseer Assistant (TTOA)', code: 'TTOA' },
  'TRADE_TEAM_OVERSEER_SUPPORT': { category: 'TRADE_TEAM', name: 'Trade Team Support (TT Support)', code: 'TT_SUPPORT' },
  
  // Trade Crew roles
  'TRADE_CREW_OVERSEER': { category: 'TRADE_CREW', name: 'Trade Crew Overseer (TCO)', code: 'TCO' },
  'TRADE_CREW_OVERSEER_ASSISTANT': { category: 'TRADE_CREW', name: 'Trade Crew Overseer Assistant (TCOA)', code: 'TCOA' },
  'TRADE_CREW_OVERSEER_SUPPORT': { category: 'TRADE_CREW', name: 'Trade Crew Support (TC Support)', code: 'TC_SUPPORT' },
  
  // Zone roles
  'ZONE_OVERSEER': { category: 'CG_OVERSIGHT', name: 'Zone Overseer (ZO)', code: 'ZO' },
  'ZONE_OVERSEER_ASSISTANT': { category: 'CG_OVERSIGHT', name: 'Zone Overseer Assistant (ZOA)', code: 'ZOA' },
  'ZONE_OVERSEER_SUPPORT': { category: 'CG_OVERSIGHT', name: 'Zone Overseer Support (ZO Support)', code: 'ZO_SUPPORT' },
};

async function main() {
  console.log('🔄 Starting User → Volunteer migration...\n');

  // Find all users without a linked volunteer
  const usersWithoutVolunteers = await prisma.user.findMany({
    where: {
      volunteerId: null,
      status: { in: ['ACTIVE', 'INVITED'] } // Only migrate active/invited users
    },
    include: {
      constructionGroup: true
    }
  });

  console.log(`📊 Found ${usersWithoutVolunteers.length} users without volunteers\n`);

  let created = 0;
  let linked = 0;
  let rolesCreated = 0;
  const errors: string[] = [];

  for (const user of usersWithoutVolunteers) {
    try {
      // Extract first/last name from user.name or use email
      const nameParts = user.name?.split(' ') || [];
      const firstName = user.firstName || nameParts[0] || user.email.split('@')[0];
      const lastName = user.lastName || nameParts.slice(1).join(' ') || '';

      // Determine email to use (prefer personal, fallback to user email)
      const emailPersonal = user.email;

      // Create volunteer record
      const volunteer = await prisma.volunteer.create({
        data: {
          firstName,
          lastName,
          emailPersonal,
          phone: null, // No phone data in User model
          congregation: null, // No congregation data in User model
          servingAs: [], // No serving data in User model
          constructionGroupId: user.constructionGroupId || '', // Required field
          isActive: user.status === 'ACTIVE',
          isOverseer: false,
          isAssistant: false,
        }
      });

      created++;
      console.log(`✅ Created volunteer: ${firstName} ${lastName} (${emailPersonal})`);

      // Link user to volunteer
      await prisma.user.update({
        where: { id: user.id },
        data: { volunteerId: volunteer.id }
      });

      linked++;
      console.log(`🔗 Linked user ${user.email} → volunteer ${volunteer.id}`);

      // Migrate ldcRole to VolunteerRole if present
      if (user.ldcRole && ROLE_MAPPING[user.ldcRole]) {
        const roleInfo = ROLE_MAPPING[user.ldcRole];
        
        await prisma.volunteerRole.create({
          data: {
            volunteerId: volunteer.id,
            roleCategory: roleInfo.category as any,
            roleName: roleInfo.name,
            roleCode: roleInfo.code,
            entityId: user.constructionGroupId, // Link to their CG
            entityType: 'CG',
            isPrimary: true,
            isActive: true,
          }
        });

        rolesCreated++;
        console.log(`📋 Created role: ${roleInfo.name} for ${firstName} ${lastName}`);
      }

      console.log(''); // Blank line for readability

    } catch (error) {
      const errorMsg = `Failed to migrate user ${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   Volunteers created: ${created}`);
  console.log(`   Users linked: ${linked}`);
  console.log(`   Organizational roles created: ${rolesCreated}`);
  
  if (errors.length > 0) {
    console.log(`\n⚠️  Errors encountered: ${errors.length}`);
    errors.forEach(err => console.log(`   - ${err}`));
  } else {
    console.log('\n✅ Migration completed successfully!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
