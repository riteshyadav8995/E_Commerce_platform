const prisma = require('../utils/prisma');

// Bill numbers used to be derived from prisma.bill.count() + 1. That breaks in
// two ways: deleting any bill makes the next number collide with an existing
// one, and two checkouts racing each other read the same count and try to
// insert the same number. Either way the unique constraint fires and the
// customer sees a 500 with no order created.
//
// Derive from the highest number actually in the table, and retry when a
// concurrent insert wins the race.
const nextBillNumber = async () => {
  const last = await prisma.bill.findFirst({
    orderBy: { id: 'desc' },
    select: { billNumber: true },
  });

  const lastSeq = last ? parseInt(String(last.billNumber).replace(/\D/g, ''), 10) : 0;
  const next = (Number.isFinite(lastSeq) ? lastSeq : 0) + 1;
  return `BILL-${String(next).padStart(6, '0')}`;
};

const isBillNumberConflict = (error) =>
  error?.code === 'P2002' &&
  [].concat(error?.meta?.target || []).some((t) => String(t).includes('billNumber'));

/**
 * Calls `create(billNumber)` with a fresh sequential number, retrying if a
 * concurrent checkout claimed the same one first.
 */
const withBillNumber = async (create, attempts = 5) => {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const billNumber = await nextBillNumber();
    try {
      return await create(billNumber);
    } catch (error) {
      if (!isBillNumberConflict(error)) throw error;
      lastError = error;
    }
  }
  throw lastError;
};

module.exports = { nextBillNumber, withBillNumber };
