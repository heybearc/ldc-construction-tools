// Script to add resolution comments to feedback items
// Run on container: node add-resolution-comments.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const resolutions = {
  // Items WITHOUT comments - use "Resolved per admin"
  'cmjh7sx5p000bah55wsqg17ms': 'Resolved per admin',
  'cmjnj0onc000huupgpfhw0ncw': 'Resolved per admin',
  'cmjkufpb7000b9baptmjd0v54': 'Resolved per admin',
  'cmjfs1cvr0003of5r55vy51r2': 'Resolved per admin',
  'cmju7ir4d0005gn4a13lfl8tk': 'Resolved per admin',
  
  // Items WITH resolution info in comments
  'cmjfspcyp0005of5rwpvm7s1x': 'This is now complete and working',
  'cmjkueysh00099bap9dp777et': 'This is now fixed',
  'cmjnj6ppr000juupgq9u54hwk': 'API was not looking in the right location for permissions. Now tested and applied.',
  'cmjoq1dr50003cj1anhe9q5x5': 'This is complete.',
  'cmjoin7j20001fm2mbb67euym': 'This was implemented.',
  'cmjor3ool0005ax0ayqopndzb': 'This is working now.',
  'cmjoqh77i000jubdfu5a994dn': 'This was fixed.',
  
  // Active items to close
  'cmjpzgitn000d12u5yepje3nb': 'User confirmed commenting functionality working after fix. Fixed by commits 61569ae and cf29d99 which allowed feedback submitters to add comments and added missing API endpoint for non-admin users.',
  'cmk4q3khs001t1sqk6rb2njaj': 'Duplicate of feedback regarding submit-on-behalf functionality. Issue was resolved by commit 6f4593f which fixed Personnel Contact role permission checks to properly query volunteer_roles table for active PC/PCA/PC_SUPPORT roles.'
};

async function addResolutionComments() {
  console.log('Starting to add resolution comments...\n');
  
  for (const [id, comment] of Object.entries(resolutions)) {
    try {
      const feedback = await prisma.feedback.findUnique({
        where: { id },
        select: { id: true, title: true, status: true }
      });
      
      if (!feedback) {
        console.log(`❌ Feedback ${id} not found`);
        continue;
      }
      
      const newStatus = ['cmjpzgitn000d12u5yepje3nb', 'cmk4q3khs001t1sqk6rb2njaj'].includes(id) 
        ? 'RESOLVED' 
        : feedback.status;
      
      await prisma.feedback.update({
        where: { id },
        data: { 
          resolutionComment: comment,
          status: newStatus
        }
      });
      
      console.log(`✅ Updated: ${feedback.title}`);
      console.log(`   Status: ${feedback.status} → ${newStatus}`);
      console.log(`   Comment: ${comment}\n`);
      
    } catch (error) {
      console.error(`❌ Error updating ${id}:`, error.message);
    }
  }
  
  console.log('\n✅ All resolution comments added!');
  await prisma.$disconnect();
}

addResolutionComments().catch(console.error);
