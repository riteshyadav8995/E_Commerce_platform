require('dotenv').config();
const prisma = require('./utils/prisma');

async function main() {
  const res = await prisma.user.deleteMany({
    where: { email: 'admin@admin.com' }
  });
  console.log('Deleted admin@admin.com:', res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
