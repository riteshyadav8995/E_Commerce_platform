require('dotenv').config();
const prisma = require('../utils/prisma');

/**
 * One-off repair.
 *
 * `User.isEmailVerified` was added to the schema but `prisma generate` was
 * never re-run, so every write of that field threw and every existing row kept
 * its `@default(false)`. Login rejects unverified non-Admin accounts, which
 * locked out every customer, cashier and delivery account in the database.
 *
 * These accounts all reached the users table through a flow that had already
 * proven ownership of the address (the OTP step in registration) or through an
 * admin-run seed script, so marking them verified restores the state the app
 * always intended. New signups are unaffected and still require a live OTP.
 */
async function main() {
  const stuck = await prisma.user.findMany({
    where: { isEmailVerified: false },
    select: { id: true, email: true, role: { select: { name: true } } },
    orderBy: { id: 'asc' },
  });

  if (stuck.length === 0) {
    console.log('Nothing to do — every account is already verified.');
    return;
  }

  console.log(`Marking ${stuck.length} account(s) as email-verified:`);
  stuck.forEach((u) => console.log(`  #${u.id} ${u.email} (${u.role.name})`));

  const { count } = await prisma.user.updateMany({
    where: { isEmailVerified: false },
    data: { isEmailVerified: true },
  });

  console.log(`\nUpdated ${count} account(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
