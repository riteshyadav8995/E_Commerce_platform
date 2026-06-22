require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./utils/prisma');

async function main() {
  const email = 'rk5061288@gmail.com';
  const password = 'ritesh@123';
  const name = 'ritesh kumar';
  const phone = '9798800286';

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  let role = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'Admin' } });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    await prisma.user.update({
      where: { email },
      data: { roleId: role.id, passwordHash: hashedPassword, phone }
    });
    console.log('Admin user updated successfully.');
  } else {
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: hashedPassword,
        roleId: role.id
      }
    });
    console.log('Admin user created successfully.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
