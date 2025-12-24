import { PrismaClient, VolunteerRoleCategory } from '@prisma/client';

const prisma = new PrismaClient();

interface RoleDefinition {
  category: VolunteerRoleCategory;
  name: string;
  code: string;
  description?: string;
}

const VOLUNTEER_ROLES: RoleDefinition[] = [
  // CG OVERSIGHT
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
    name: 'Construction Group Overseer Support',
    code: 'CGO-Support',
    description: 'Provides support to Construction Group Overseer'
  },

  // CG STAFF - FROM ORG CHART
  {
    category: 'CG_STAFF',
    name: 'Construction Group Members',
    code: 'CG-Member',
    description: 'Construction Group member'
  },
  {
    category: 'CG_STAFF',
    name: 'Construction Group Members Assistant',
    code: 'CG-Member-Asst',
    description: 'Assists Construction Group members'
  },
  {
    category: 'CG_STAFF',
    name: 'Construction Group Members Support',
    code: 'CG-Member-Support',
    description: 'Provides support to Construction Group members'
  },
  {
    category: 'CG_STAFF',
    name: 'Safety Coordinator',
    code: 'SC',
    description: 'Coordinates safety for Construction Group'
  },
  {
    category: 'CG_STAFF',
    name: 'Safety Coordinator Assistant',
    code: 'SC-Asst',
    description: 'Assists Safety Coordinator'
  },
  {
    category: 'CG_STAFF',
    name: 'Safety Coordinator Support',
    code: 'SC-Support',
    description: 'Provides support to Safety Coordinator'
  },
  {
    category: 'CG_STAFF',
    name: 'Project Construction Coordinator',
    code: 'PCC',
    description: 'Coordinates project construction activities'
  },
  {
    category: 'CG_STAFF',
    name: 'Project Construction Coordinator Assistant',
    code: 'PCC-Asst',
    description: 'Assists Project Construction Coordinator'
  },
  {
    category: 'CG_STAFF',
    name: 'Project Construction Coordinator Support',
    code: 'PCC-Support',
    description: 'Provides support to Project Construction Coordinator'
  },
  {
    category: 'CG_STAFF',
    name: 'Regulatory Consultant',
    code: 'RC',
    description: 'Provides regulatory consultation'
  },
  {
    category: 'CG_STAFF',
    name: 'Regulatory Consultant Assistant',
    code: 'RC-Asst',
    description: 'Assists Regulatory Consultant'
  },
  {
    category: 'CG_STAFF',
    name: 'Regulatory Consultant Support',
    code: 'RC-Support',
    description: 'Provides support to Regulatory Consultant'
  },
  {
    category: 'CG_STAFF',
    name: 'Estimator',
    code: 'EST',
    description: 'Provides cost estimation services'
  },
  {
    category: 'CG_STAFF',
    name: 'Estimator Assistant',
    code: 'EST-Asst',
    description: 'Assists Estimator'
  },
  {
    category: 'CG_STAFF',
    name: 'Estimator Support',
    code: 'EST-Support',
    description: 'Provides support to Estimator'
  },
  {
    category: 'CG_STAFF',
    name: 'Scheduler',
    code: 'SCHED',
    description: 'Manages Construction Group scheduling'
  },
  {
    category: 'CG_STAFF',
    name: 'Scheduler Assistant',
    code: 'SCHED-Asst',
    description: 'Assists Scheduler'
  },
  {
    category: 'CG_STAFF',
    name: 'Scheduler Support',
    code: 'SCHED-Support',
    description: 'Provides support to Scheduler'
  },

  // REGION SUPPORT SERVICES
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Equipment Management Contact',
    code: 'EMC',
    description: 'Manages equipment for region'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Equipment Management Contact Assistant',
    code: 'EMC-Asst',
    description: 'Assists Equipment Management Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Equipment Management Contact Support',
    code: 'EMC-Support',
    description: 'Provides support to Equipment Management Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Housing Contact',
    code: 'HC',
    description: 'Coordinates housing for volunteers'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Housing Contact Assistant',
    code: 'HC-Asst',
    description: 'Assists Housing Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Housing Contact Support',
    code: 'HC-Support',
    description: 'Provides support to Housing Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Personnel Contact',
    code: 'PC',
    description: 'Regional personnel coordination'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Personnel Contact Assistant',
    code: 'PCA',
    description: 'Assists Personnel Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Personnel Contact Support',
    code: 'PC-Support',
    description: 'Provides support to Personnel Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Regulatory Contact',
    code: 'REG',
    description: 'Regional regulatory coordination'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Regulatory Contact Assistant',
    code: 'REG-Asst',
    description: 'Assists Regulatory Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Regulatory Contact Support',
    code: 'REG-Support',
    description: 'Provides support to Regulatory Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Safety Coordinator Contact',
    code: 'SCC',
    description: 'Regional safety coordination contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Safety Coordinator Contact Assistant',
    code: 'SCC-Asst',
    description: 'Assists Safety Coordinator Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Safety Coordinator Contact Support',
    code: 'SCC-Support',
    description: 'Provides support to Safety Coordinator Contact'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Sourcing Buyer',
    code: 'SB',
    description: 'Manages sourcing and purchasing'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Sourcing Buyer Assistant',
    code: 'SB-Asst',
    description: 'Assists Sourcing Buyer'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Sourcing Buyer Support',
    code: 'SB-Support',
    description: 'Provides support to Sourcing Buyer'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Training Organizer',
    code: 'TO',
    description: 'Organizes training for volunteers'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Training Organizer Assistant',
    code: 'TO-Asst',
    description: 'Assists Training Organizer'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Training Organizer Support',
    code: 'TO-Support',
    description: 'Provides support to Training Organizer'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Translation Buyer',
    code: 'TB',
    description: 'Manages translation services'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Translation Buyer Assistant',
    code: 'TB-Asst',
    description: 'Assists Translation Buyer'
  },
  {
    category: 'REGION_SUPPORT_SERVICES',
    name: 'Translation Buyer Support',
    code: 'TB-Support',
    description: 'Provides support to Translation Buyer'
  },

  // TRADE TEAM
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
    description: 'Provides support to trade team'
  },

  // TRADE CREW
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
    description: 'Provides support to trade crew'
  },
  {
    category: 'TRADE_CREW',
    name: 'Trade Crew Volunteer',
    code: 'TCV',
    description: 'Volunteer member of trade crew'
  }
];

async function seedVolunteerRoles() {
  console.log('Starting volunteer roles seed...');

  try {
    // Clear existing roles (optional - comment out if you want to keep existing data)
    // await prisma.role.deleteMany({});
    // console.log('Cleared existing roles');

    // Note: This seed file defines the available roles but doesn't create database records
    // Roles are defined in the API and assigned to volunteers through the VolunteerRole junction table
    
    console.log(`Defined ${VOLUNTEER_ROLES.length} volunteer roles:`);
    console.log(`- CG Oversight: ${VOLUNTEER_ROLES.filter(r => r.category === 'CG_OVERSIGHT').length} roles`);
    console.log(`- CG Staff: ${VOLUNTEER_ROLES.filter(r => r.category === 'CG_STAFF').length} roles`);
    console.log(`- Trade Team: ${VOLUNTEER_ROLES.filter(r => r.category === 'TRADE_TEAM').length} roles`);
    console.log(`- Trade Crew: ${VOLUNTEER_ROLES.filter(r => r.category === 'TRADE_CREW').length} roles`);
    
    console.log('\nVolunteer roles seed completed successfully!');
  } catch (error) {
    console.error('Error seeding volunteer roles:', error);
    throw error;
  }
}

seedVolunteerRoles()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
