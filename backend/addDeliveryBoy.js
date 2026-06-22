const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  let role = await prisma.role.findUnique({ where: { name: 'DeliveryBoy' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'DeliveryBoy' } });
    console.log('Created Role: DeliveryBoy');
  }

  const email = 'delivery@example.com';
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Raju Delivery',
        email,
        passwordHash: await bcrypt.hash('password123', 10),
        roleId: role.id
      }
    });
    console.log('Created Delivery Boy User:', user.email);
  } else {
    console.log('Delivery Boy already exists:', user.email);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
