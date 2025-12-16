// Seed script for multi-tenant hierarchy
// Run with: node prisma/seed-multi-tenant.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding multi-tenant hierarchy...');

  // 1. Create US Branch
  const usBranch = await prisma.branch.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States Branch',
      description: 'United States Branch Territory',
      isActive: true,
    },
  });
  console.log('✅ Created Branch:', usBranch.name);

  // 2. Create 5 Zones
  const zones = [];
  for (let i = 1; i <= 5; i++) {
    const zoneCode = i.toString().padStart(2, '0');
    const zone = await prisma.zone.upsert({
      where: { code: zoneCode },
      update: {},
      create: {
        code: zoneCode,
        name: `Zone ${i}`,
        branchId: usBranch.id,
        description: `US Branch Zone ${i}`,
        isActive: true,
      },
    });
    zones.push(zone);
    console.log('✅ Created Zone:', zone.name);
  }

  // 3. Create Region 01.12 (your current region) in Zone 1
  const region0112 = await prisma.region.upsert({
    where: { code: '01.12' },
    update: {},
    create: {
      code: '01.12',
      name: 'Region 01.12',
      zoneId: zones[0].id, // Zone 1
      description: 'Region 01.12 in Zone 1',
      isActive: true,
    },
  });
  console.log('✅ Created Region:', region0112.name);

  // 4. Create default Construction Group for Region 01.12
  const defaultCG = await prisma.constructionGroup.upsert({
    where: { code: 'CG 01.12' },
    update: {},
    create: {
      code: 'CG 01.12',
      name: 'CG 01.12',
      regionId: region0112.id,
      description: 'Primary Construction Group for Region 01.12',
      isActive: true,
    },
  });
  console.log('✅ Created Construction Group:', defaultCG.name);

  // 5. Assign all existing users to the default CG
  const usersUpdated = await prisma.user.updateMany({
    where: {
      constructionGroupId: null,
    },
    data: {
      constructionGroupId: defaultCG.id,
    },
  });
  console.log(`✅ Assigned ${usersUpdated.count} users to default CG`);

  // 6. Assign all existing TradeTeams to the default CG
  const tradeTeamsUpdated = await prisma.tradeTeam.updateMany({
    where: {
      constructionGroupId: null,
    },
    data: {
      constructionGroupId: defaultCG.id,
    },
  });
  console.log(`✅ Assigned ${tradeTeamsUpdated.count} trade teams to default CG`);

  // 7. Assign all existing Crews to the default CG
  const crewsUpdated = await prisma.crew.updateMany({
    where: {
      constructionGroupId: null,
    },
    data: {
      constructionGroupId: defaultCG.id,
    },
  });
  console.log(`✅ Assigned ${crewsUpdated.count} crews to default CG`);

  // 8. Assign all existing Projects to the default CG
  const projectsUpdated = await prisma.project.updateMany({
    where: {
      constructionGroupId: null,
    },
    data: {
      constructionGroupId: defaultCG.id,
    },
  });
  console.log(`✅ Assigned ${projectsUpdated.count} projects to default CG`);

  console.log('\n🎉 Multi-tenant hierarchy seeding complete!');
  console.log('\nHierarchy created:');
  console.log(`  Branch: ${usBranch.name} (${usBranch.code})`);
  console.log(`  Zones: ${zones.map(z => z.name).join(', ')}`);
  console.log(`  Region: ${region0112.name} (${region0112.code})`);
  console.log(`  Construction Group: ${defaultCG.name} (${defaultCG.code})`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
