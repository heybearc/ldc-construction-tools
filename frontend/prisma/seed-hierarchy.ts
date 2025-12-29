import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHierarchy() {
  console.log('🌱 Seeding organizational hierarchy...');

  // 1. Create US Branch
  console.log('📍 Creating US Branch...');
  const usBranch = await prisma.branch.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      code: 'US',
      name: 'United States Branch',
      description: 'United States Branch Office',
      isActive: true,
    },
  });
  console.log(`✅ Created Branch: ${usBranch.name} (${usBranch.code})`);

  // 2. Create 5 Zones
  console.log('\n📍 Creating Zones...');
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
        description: `Zone ${i} - United States`,
        isActive: true,
      },
    });
    zones.push(zone);
    console.log(`✅ Created Zone: ${zone.name} (${zone.code})`);
  }

  // 3. Create Regions
  console.log('\n📍 Creating Regions...');
  
  // Region 01.12 (User's region)
  const region0112 = await prisma.region.upsert({
    where: { code: '01.12' },
    update: {},
    create: {
      code: '01.12',
      name: 'Region 01.12',
      zoneId: zones[0].id, // Zone 01
      description: 'Region 01.12 - Zone 1',
      isActive: true,
    },
  });
  console.log(`✅ Created Region: ${region0112.name} (${region0112.code})`);

  // Region 02.05 (Test region for isolation testing)
  const region0205 = await prisma.region.upsert({
    where: { code: '02.05' },
    update: {},
    create: {
      code: '02.05',
      name: 'Region 02.05',
      zoneId: zones[1].id, // Zone 02
      description: 'Region 02.05 - Zone 2 (Test Region)',
      isActive: true,
    },
  });
  console.log(`✅ Created Region: ${region0205.name} (${region0205.code})`);

  // 4. Create Construction Groups
  console.log('\n📍 Creating Construction Groups...');
  
  // CG 01.12 (User's CG)
  const cg0112 = await prisma.constructionGroup.upsert({
    where: { code: 'CG 01.12' },
    update: {},
    create: {
      code: 'CG 01.12',
      name: 'Construction Group 01.12',
      regionId: region0112.id,
      description: 'Primary Construction Group for Region 01.12',
      isActive: true,
    },
  });
  console.log(`✅ Created CG: ${cg0112.name} (${cg0112.code})`);

  // CG 02.05 (Test CG for isolation)
  const cg0205 = await prisma.constructionGroup.upsert({
    where: { code: 'CG 02.05' },
    update: {},
    create: {
      code: 'CG 02.05',
      name: 'Construction Group 02.05',
      regionId: region0205.id,
      description: 'Test Construction Group for Region 02.05 (for isolation testing)',
      isActive: true,
    },
  });
  console.log(`✅ Created CG: ${cg0205.name} (${cg0205.code})`);

  // 5. Migrate existing users to CG 01.12
  console.log('\n📍 Migrating existing users to CG 01.12...');
  const usersWithoutCG = await prisma.user.findMany({
    where: { constructionGroupId: null },
  });
  
  if (usersWithoutCG.length > 0) {
    await prisma.user.updateMany({
      where: { constructionGroupId: null },
      data: { constructionGroupId: cg0112.id },
    });
    console.log(`✅ Migrated ${usersWithoutCG.length} users to CG 01.12`);
  } else {
    console.log('ℹ️  No users to migrate (all already have CG assignment)');
  }

  // 6. Migrate existing trade teams to CG 01.12
  console.log('\n📍 Migrating existing trade teams to CG 01.12...');
  const tradeTeamsWithoutCG = await prisma.tradeTeam.findMany({
    where: { constructionGroupId: null },
  });
  
  if (tradeTeamsWithoutCG.length > 0) {
    await prisma.tradeTeam.updateMany({
      where: { constructionGroupId: null },
      data: { constructionGroupId: cg0112.id },
    });
    console.log(`✅ Migrated ${tradeTeamsWithoutCG.length} trade teams to CG 01.12`);
  } else {
    console.log('ℹ️  No trade teams to migrate (all already have CG assignment)');
  }

  // 7. Migrate existing crews to CG 01.12
  console.log('\n📍 Migrating existing crews to CG 01.12...');
  const crewsWithoutCG = await prisma.crew.findMany({
    where: { constructionGroupId: null },
  });
  
  if (crewsWithoutCG.length > 0) {
    await prisma.crew.updateMany({
      where: { constructionGroupId: null },
      data: { constructionGroupId: cg0112.id },
    });
    console.log(`✅ Migrated ${crewsWithoutCG.length} crews to CG 01.12`);
  } else {
    console.log('ℹ️  No crews to migrate (all already have CG assignment)');
  }

  // 8. Migrate existing projects to CG 01.12
  console.log('\n📍 Migrating existing projects to CG 01.12...');
  const projectsWithoutCG = await prisma.project.findMany({
    where: { constructionGroupId: null },
  });
  
  if (projectsWithoutCG.length > 0) {
    await prisma.project.updateMany({
      where: { constructionGroupId: null },
      data: { constructionGroupId: cg0112.id },
    });
    console.log(`✅ Migrated ${projectsWithoutCG.length} projects to CG 01.12`);
  } else {
    console.log('ℹ️  No projects to migrate (all already have CG assignment)');
  }

  // 9. Check volunteers (constructionGroupId is required, so all should have it)
  console.log('\n📍 Checking volunteers...');
  const volunteerCount = await prisma.volunteer.count();
  console.log(`ℹ️  Found ${volunteerCount} volunteers (constructionGroupId is required field)`);

  // 10. Check congregations (constructionGroupId is required, so all should have it)
  console.log('\n📍 Checking congregations...');
  const congregationCount = await prisma.congregation.count();
  console.log(`ℹ️  Found ${congregationCount} congregations (constructionGroupId is required field)`);

  console.log('\n✅ Hierarchy seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Branch (US)`);
  console.log(`   - 5 Zones (01-05)`);
  console.log(`   - 2 Regions (01.12, 02.05)`);
  console.log(`   - 2 Construction Groups (CG 01.12, CG 02.05)`);
  console.log(`   - All existing data migrated to CG 01.12`);
}

seedHierarchy()
  .catch((e) => {
    console.error('❌ Error seeding hierarchy:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
