import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding LDC Construction Tools database...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@ldc-construction.local' }
  });

  if (existingAdmin) {
    console.log('ℹ️  Admin user already exists, skipping creation');
    return;
  }

  // Create default admin user
  const adminPassword = 'AdminPass123!';
  const passwordHash = bcrypt.hashSync(adminPassword, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ldc-construction.local',
      name: 'System Administrator',
      firstName: 'System',
      lastName: 'Administrator',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      regionId: '01.12',
      zoneId: '01',
      passwordHash: passwordHash,
      emailVerified: new Date(),
      loginCount: 0
    }
  });

  console.log('✅ Default admin user created:');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Role: ${adminUser.role}`);
  console.log(`   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!`);

  // Create default email configuration template
  const existingEmailConfig = await prisma.emailConfiguration.findFirst();
  
  if (!existingEmailConfig) {
    await prisma.emailConfiguration.create({
      data: {
        provider: 'gmail',
        displayName: 'LDC Construction Tools Gmail',
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        username: 'your-email@gmail.com',
        appPasswordEncrypted: 'CONFIGURE_GMAIL_APP_PASSWORD',
        fromEmail: 'your-email@gmail.com',
        fromName: 'LDC Construction Tools',
        encryption: 'tls',
        isDefault: true,
        isActive: false,
        testStatus: 'untested',
        regionId: '01.12'
      }
    });

    console.log('✅ Default email configuration template created');
    console.log('   Configure Gmail SMTP settings in the admin panel');
  }

  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
