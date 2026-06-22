require('dotenv').config();
const prisma = require('./utils/prisma');

async function main() {
  await prisma.user.updateMany({
    where: { name: 'Ritesh Kumar' },
    data: { phone: '9798800286' }
  });
  console.log('Updated all Ritesh Kumars to have phone 9798800286');
}

main().catch(console.error).finally(() => prisma.$disconnect());
