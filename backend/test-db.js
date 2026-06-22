require('dotenv').config();
const prisma = require('./utils/prisma');

async function main() {
  const msgs = await prisma.whatsAppMessage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log("Recent WhatsApp Messages:", msgs);
}

main().catch(console.error);
