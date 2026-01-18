import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestDataCG0205() {
  console.log('🧪 Creating test data for CG 02.05...');

  // Get CG 02.05
  const cg0205 = await prisma.constructionGroup.findUnique({
    where: { code: 'CG 02.05' },
  });

  if (!cg0205) {
    console.error('❌ CG 02.05 not found! Run seed-hierarchy.ts first.');
    process.exit(1);
  }

  console.log(`✅ Found CG 02.05: ${cg0205.name} (${cg0205.id})`);

  // 1. Create test trade team
  console.log('\n📍 Creating test trade team in CG 02.05...');
  let testTradeTeam = await prisma.tradeTeam.findFirst({
    where: { 
      name: 'Test Electrical Team',
      constructionGroupId: cg0205.id
    }
  });
  
  if (!testTradeTeam) {
    testTradeTeam = await prisma.tradeTeam.create({
      data: {
        name: 'Test Electrical Team',
        description: 'Test trade team for CG 02.05 isolation testing',
        constructionGroupId: cg0205.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Trade Team: ${testTradeTeam.name} (${testTradeTeam.id})`);

  // 2. Create test crew
  console.log('\n📍 Creating test crew in CG 02.05...');
  let testCrew = await prisma.crew.findFirst({
    where: {
      name: 'Test Electrical Crew A',
      tradeTeamId: testTradeTeam.id
    }
  });
  
  if (!testCrew) {
    testCrew = await prisma.crew.create({
      data: {
        name: 'Test Electrical Crew A',
        description: 'Test crew for CG 02.05',
        tradeTeamId: testTradeTeam.id,
        constructionGroupId: cg0205.id,
        status: 'ACTIVE',
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Crew: ${testCrew.name} (${testCrew.id})`);

  // 3. Create test volunteers
  console.log('\n📍 Creating test volunteers in CG 02.05...');
  
  let testVolunteer1 = await prisma.volunteer.findFirst({
    where: {
      baId: 'TEST-0205-001',
      constructionGroupId: cg0205.id
    }
  });
  
  if (!testVolunteer1) {
    testVolunteer1 = await prisma.volunteer.create({
      data: {
        firstName: 'John',
        lastName: 'TestUser',
        baId: 'TEST-0205-001',
        phone: '555-0205-001',
        emailPersonal: 'john.test@example.com',
        congregation: 'Test Congregation 02.05',
        servingAs: ['Elder'],
        constructionGroupId: cg0205.id,
        tradeTeamId: testTradeTeam.id,
        crewId: testCrew.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Volunteer: ${testVolunteer1.firstName} ${testVolunteer1.lastName}`);

  let testVolunteer2 = await prisma.volunteer.findFirst({
    where: {
      baId: 'TEST-0205-002',
      constructionGroupId: cg0205.id
    }
  });
  
  if (!testVolunteer2) {
    testVolunteer2 = await prisma.volunteer.create({
      data: {
        firstName: 'Jane',
        lastName: 'TestUser',
        baId: 'TEST-0205-002',
        phone: '555-0205-002',
        emailPersonal: 'jane.test@example.com',
        congregation: 'Test Congregation 02.05',
        servingAs: ['Regular Pioneer'],
        constructionGroupId: cg0205.id,
        tradeTeamId: testTradeTeam.id,
        crewId: testCrew.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Volunteer: ${testVolunteer2.firstName} ${testVolunteer2.lastName}`);

  // 4. Create test project
  console.log('\n📍 Creating test project in CG 02.05...');
  
  // Get Region 02.05 for the project
  const region0205 = await prisma.region.findUnique({
    where: { code: '02.05' }
  });
  
  if (!region0205) {
    console.error('❌ Region 02.05 not found!');
    process.exit(1);
  }
  
  let testProject = await prisma.project.findFirst({
    where: {
      projectNumber: 'TEST-02-05-001',
      constructionGroupId: cg0205.id
    }
  });
  
  if (!testProject) {
    testProject = await prisma.project.create({
      data: {
        name: 'Test Kingdom Hall - Region 02.05',
        projectNumber: 'TEST-02-05-001',
        projectType: 'NEW_CONSTRUCTION',
        status: 'PLANNING',
        location: '123 Test Street, Test City, CA 90210',
        regionId: region0205.id,
        constructionGroupId: cg0205.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Project: ${testProject.name} (${testProject.projectNumber})`);

  // 5. Create test congregation
  console.log('\n📍 Creating test congregation in CG 02.05...');
  let testCongregation = await prisma.congregation.findFirst({
    where: {
      congregationNumber: 'TEST-02-05',
      constructionGroupId: cg0205.id
    }
  });
  
  if (!testCongregation) {
    testCongregation = await prisma.congregation.create({
      data: {
        name: 'Test Congregation 02.05',
        congregationNumber: 'TEST-02-05',
        state: 'CA',
        coordinatorName: 'Test Coordinator',
        coordinatorPhone: '555-0205-000',
        coordinatorEmail: 'coordinator@test0205.example.com',
        constructionGroupId: cg0205.id,
        isActive: true,
      },
    });
  }
  console.log(`✅ Created Congregation: ${testCongregation.name}`);

  console.log('\n✅ Test data seeding complete for CG 02.05!');
  console.log('\n📊 Summary:');
  console.log(`   - 1 Trade Team: ${testTradeTeam.name}`);
  console.log(`   - 1 Crew: ${testCrew.name}`);
  console.log(`   - 2 Volunteers: John TestUser, Jane TestUser`);
  console.log(`   - 1 Project: ${testProject.name}`);
  console.log(`   - 1 Congregation: ${testCongregation.name}`);
  console.log('\n🧪 Ready to test data isolation!');
}

seedTestDataCG0205()
  .catch((e) => {
    console.error('❌ Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
