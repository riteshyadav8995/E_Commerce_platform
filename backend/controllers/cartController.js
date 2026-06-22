const prisma = require('../utils/prisma');

const syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const userId = req.user.id;

    // 1. Get the logged in user to find their phone number
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.phone) {
      return res.status(400).json({ message: 'User does not have a phone number linked.' });
    }

    // 2. Find or create the Customer record
    let customer = await prisma.customer.findUnique({ where: { phone: user.phone } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: user.phone,
          name: user.name
        }
      });
    }

    // 3. Find existing active cart
    let cart = await prisma.cart.findFirst({
      where: { customerId: customer.id, status: 'active' },
      include: { items: true }
    });

    if (cart) {
      // Clear existing items in the cart
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    } else {
      // Create new cart
      cart = await prisma.cart.create({
        data: { customerId: customer.id }
      });
    }

    // 4. Add new items
    if (cartItems && cartItems.length > 0) {
      const itemsToCreate = cartItems.map(item => ({
        cartId: cart.id,
        productId: item.product.id,
        quantity: item.quantity
      }));
      await prisma.cartItem.createMany({ data: itemsToCreate });
    }

    // 5. Update cart's updatedAt to trigger cron job properly
    await prisma.cart.update({
      where: { id: cart.id },
      data: { status: 'active', updatedAt: new Date() }
    });

    res.json({ message: 'Cart synced successfully', cartId: cart.id });
  } catch (error) {
    console.error('Cart Sync Error:', error);
    res.status(500).json({ message: 'Failed to sync cart' });
  }
};

module.exports = { syncCart };
