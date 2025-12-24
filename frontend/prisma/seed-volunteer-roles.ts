import { PrismaClient, VolunteerRoleCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface RoleDefinition {
  category: VolunteerRoleCategory;
  name: string;
  code: string;
  description?: string;
}

const VOLUNTEER_ROLES: RoleDefinition[] = [
  // CG OVERSIGHT ROLES
  {
    category: 'CG_OVERSIGHT',
    name: 'Construction Group Overseer',
    code: 'CGO',
    description: 'Oversees all Construction Group operations'
  },
  {
    category: 'CG_OVERSIGHT',
    name: 'Assistant Construction Group Overseer',
    code: 'ACGO',
    description: 'Assists CGO with Construction Group operations'
  },
  {
    category: 'CG_OVERSIGHT',
    name: 'Construction Group Support',
    code: 'CG-Support',
    description: 'Provides administrative support to Construction Group'
  },

  // CONSTRUCTION STAFF - REGIONAL ROLES
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Construction Field Rep',
    code: 'CFR',
    description: 'Regional construction field representative'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Construction Field Rep - RA Support',
    code: 'CFR-RA',
    description: 'CFR providing Regional Architect support'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Rep',
    code: 'FR',
    description: 'Regional field representative'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Rep (Wife)',
    code: 'FR-W',
    description: 'Field representative (wife)'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Rep Assistant',
    code: 'FRAA',
    description: 'Assists Field Rep'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Rep Assistant (Wife)',
    code: 'FRAA-W',
    description: 'Field Rep Assistant (wife)'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Design Contact',
    code: 'DC',
    description: 'Regional design coordination contact'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Design Lead',
    code: 'DL',
    description: 'Regional design team lead'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Purchasing Field Rep',
    code: 'PFR',
    description: 'Regional purchasing representative'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Local Cost Controller',
    code: 'LCC',
    description: 'Regional cost control'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Cost Controller',
    code: 'LCC-Field',
    description: 'Field-level cost control'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Field Cost Controller (Wife)',
    code: 'LCC-Field-W',
    description: 'Field Cost Controller (wife)'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Personnel/Training Contact',
    code: 'PTC',
    description: 'Regional personnel and training coordination'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Personnel/Training Contact (Wife)',
    code: 'PTC-W',
    description: 'Personnel/Training Contact (wife)'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Housing Contact',
    code: 'HC',
    description: 'Regional housing coordination'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Housing Contact Assistant',
    code: 'HC-Asst',
    description: 'Assists Housing Contact'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Housing Contact Support',
    code: 'HC-Support',
    description: 'Provides support to Housing Contact'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Zone Safety Contact',
    code: 'ZSC',
    description: 'Zone-level safety coordination'
  },

  // CONSTRUCTION STAFF - TRADE DISCIPLINES
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Mechanical',
    code: 'MECH',
    description: 'Mechanical systems specialist'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Structural & Roofing',
    code: 'STRUCT',
    description: 'Structural and roofing specialist'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Electrical',
    code: 'ELEC',
    description: 'Electrical systems specialist'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Architectural',
    code: 'ARCH',
    description: 'Architectural design specialist'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'A/V & Low Voltage',
    code: 'AV-LV',
    description: 'Audio/Visual and low voltage systems specialist'
  },
  {
    category: 'CONSTRUCTION_STAFF',
    name: 'Plumbing',
    code: 'PLUMB',
    description: 'Plumbing systems specialist'
  },

  // TRADE TEAM ROLES
  {
    category: 'TRADE_TEAM',
    name: 'Trade Team Overseer',
    code: 'TTO',
    description: 'Oversees trade team operations'
  },
  {
    category: 'TRADE_TEAM',
    name: 'Trade Team Overseer Assistant',
    code: 'TTOA',
    description: 'Assists Trade Team Overseer'
  },
  {
    category: 'TRADE_TEAM',
    name: 'Trade Team Support',
    code: 'TTS',
    description: 'Provides administrative support to trade team'
  },

  // TRADE CREW ROLES
  {
    category: 'TRADE_CREW',
    name: 'Trade Crew Overseer',
    code: 'TCO',
    description: 'Oversees trade crew operations'
  },
  {
    category: 'TRADE_CREW',
    name: 'Trade Crew Overseer Assistant',
    code: 'TCOA',
    description: 'Assists Trade Crew Overseer'
  },
  {
    category: 'TRADE_CREW',
    name: 'Trade Crew Support',
    code: 'TCS',
    description: 'Provides administrative support to trade crew'
  },
  {
    category: 'TRADE_CREW',
    name: 'Trade Crew Volunteer',
    code: 'TCV',
    description: 'Active trade crew member'
  },

  // PROJECT STAFF ROLES
  {
    category: 'PROJECT_STAFF',
    name: 'Project Staffing Contact',
    code: 'PSC',
    description: 'Coordinates project staffing needs'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Project Staffing Contact - Assistant',
    code: 'PSC-Asst',
    description: 'Assists Project Staffing Contact'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Local Project Regulatory Contact',
    code: 'LPRC',
    description: 'Manages project regulatory compliance'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Project Construction Coordinator',
    code: 'PCC',
    description: 'Coordinates overall project construction'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Project Construction Coordinator - Assistant #1',
    code: 'PCC-Asst1',
    description: 'First assistant to PCC'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Project Construction Coordinator - Assistant #2',
    code: 'PCC-Asst2',
    description: 'Second assistant to PCC'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Safety Coordinator',
    code: 'SC',
    description: 'Project safety coordination'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Safety Coordinator - Assistant #1',
    code: 'SC-Asst1',
    description: 'First assistant to Safety Coordinator'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Safety Coordinator - Assistant #2',
    code: 'SC-Asst2',
    description: 'Second assistant to Safety Coordinator'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Maintenance Trainer',
    code: 'MT',
    description: 'Provides maintenance training'
  },
  {
    category: 'PROJECT_STAFF',
    name: 'Maintenance Trainer Assistant',
    code: 'MTA',
    description: 'Assists Maintenance Trainer'
  }
];

async function seedVolunteerRoles() {
  console.log('🌱 Seeding volunteer roles...');

  let created = 0;
  let skipped = 0;

  for (const role of VOLUNTEER_ROLES) {
    try {
      // Check if role already exists
      const existing = await prisma.volunteerRole.findFirst({
        where: {
          roleCategory: role.category,
          roleName: role.name
        }
      });

      if (existing) {
        console.log(`⏭️  Skipped: ${role.name} (${role.code}) - already exists`);
        skipped++;
        continue;
      }

      // Create the role definition
      // Note: We're not creating actual VolunteerRole records here,
      // those are created when volunteers are assigned roles.
      // This is just documenting the available roles.
      
      console.log(`✅ Documented: ${role.name} (${role.code})`);
      created++;
    } catch (error) {
      console.error(`❌ Error with role ${role.name}:`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Created: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Total: ${VOLUNTEER_ROLES.length}`);
  console.log('\n✨ Role definitions documented!');
  console.log('\n📝 Note: These are role definitions. Actual role assignments');
  console.log('   are created in the volunteer_roles table when volunteers');
  console.log('   are assigned to these roles.');
}

seedVolunteerRoles()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
