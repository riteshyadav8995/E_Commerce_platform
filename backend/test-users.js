require('dotenv').config();
const prisma = require('./utils/prisma');

async function main() {
  const users = await prisma.user.findMany();
  console.log(users.map(u => ({ id: u.id, name: u.name, phone: u.phone })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
