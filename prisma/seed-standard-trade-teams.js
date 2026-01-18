// Seed script to add standard trade teams to existing Construction Groups
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const STANDARD_TRADE_TEAMS = [
  { name: 'Electrical', description: 'Electrical systems installation and maintenance' },
  { name: 'Exteriors', description: 'Exterior finishing, siding, roofing, and weatherproofing' },
  { name: 'Interiors', description: 'Interior finishing, drywall, painting, and trim work' },
  { name: 'Mechanical', description: 'HVAC systems and mechanical equipment installation' },
  { name: 'Plumbing', description: 'Plumbing systems installation and maintenance' },
  { name: 'Site Support', description: 'General site support, logistics, and material handling' },
  { name: 'Sitework/Civil', description: 'Site preparation, grading, and civil infrastructure' },
  { name: 'Structural', description: 'Structural framing, concrete, and foundation work' }
];

async function seedStandardTradeTeams() {
  console.log('🔧 Seeding standard trade teams for existing Construction Groups...\n');

  // Get all construction groups
  const constructionGroups = await prisma.constructionGroup.findMany({
    include: {
      tradeTeams: true
    }
  });

  console.log(`Found ${constructionGroups.length} Construction Groups\n`);

  for (const cg of constructionGroups) {
    console.log(`\n📍 Processing CG: ${cg.code} (${cg.name})`);
    console.log(`   Current trade teams: ${cg.tradeTeams.length}`);

    // Check which standard teams are missing
    const existingNames = cg.tradeTeams.map(t => t.name);
    const missingTeams = STANDARD_TRADE_TEAMS.filter(t => !existingNames.includes(t.name));

    if (missingTeams.length === 0) {
      console.log(`   ✅ All standard trade teams already exist`);
      continue;
    }

    console.log(`   ⚠️  Missing ${missingTeams.length} standard trade teams`);

    // Create missing trade teams
    for (const team of missingTeams) {
      await prisma.tradeTeam.create({
        data: {
          name: team.name,
          description: team.description,
          constructionGroupId: cg.id,
          isActive: true
        }
      });
      console.log(`   ➕ Created: ${team.name}`);
    }
  }

  console.log('\n✅ Standard trade teams seeding complete!');
}

seedStandardTradeTeams()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
