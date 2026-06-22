const cron = require('node-cron');
const prisma = require('../utils/prisma');
const { sendWhatsAppMessage } = require('./whatsappService');

/**
 * Initializes cron jobs for Abandoned Cart Recovery
 */
const initAbandonedCartCron = () => {
  // Runs every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('[Cron] Running Abandoned Cart Check...');
    try {
      const now = new Date();
      const thirtyMinsAgo = new Date(now.getTime() - 30 * 60000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60000);

      // --- STEP 1: Find carts inactive for > 30 mins ---
      const activeCarts = await prisma.cart.findMany({
        where: {
          status: 'active',
          updatedAt: { lt: thirtyMinsAgo },
          abandoned: null // Has not been moved to AbandonedCart table yet
        },
        include: {
          customer: true,
          items: {
            include: { product: true }
          }
        }
      });

      for (const cart of activeCarts) {
        if (cart.items.length === 0) continue; // Skip empty carts

        // Create AbandonedCart record
        await prisma.abandonedCart.create({
          data: {
            cartId: cart.id,
            customerId: cart.customerId,
            reminder1Sent: true
          }
        });

        // Update cart status
        await prisma.cart.update({
          where: { id: cart.id },
          data: { status: 'abandoned' }
        });

        // Send WhatsApp Message (Reminder 1)
        if (cart.customer.phone) {
          const message = `Hi ${cart.customer.name || 'there'},\n\nYour cart is waiting 🛒\n\nYou left some items in your cart. Complete your purchase now:\nhttp://localhost:5173/store\n\nOr reply "Cart" to view your items.`;
          await sendWhatsAppMessage(cart.customer.phone, message);
          console.log(`[Cron] Sent 30-min reminder to ${cart.customer.phone}`);
        }
      }

      // --- STEP 2: Find abandoned carts older than 24 hours ---
      const abandonedCarts = await prisma.abandonedCart.findMany({
        where: {
          reminder2Sent: false,
          createdAt: { lt: twentyFourHoursAgo },
          cart: {
            status: 'abandoned' // Make sure they haven't checked out (which deletes the cart)
          }
        },
        include: {
          customer: true
        }
      });

      for (const abandoned of abandonedCarts) {
        // Send WhatsApp Message (Reminder 2)
        if (abandoned.customer.phone) {
          const message = `Hi ${abandoned.customer.name || 'there'},\n\nWe noticed you still have items in your cart. 🛒\n\nGet 10% OFF your entire order!\nUse Code: *SAVE10*\n\nComplete your purchase:\nhttp://localhost:5173/store\n\nOr reply "Cart" to view your items.`;
          await sendWhatsAppMessage(abandoned.customer.phone, message);
          
          // Mark 2nd reminder as sent
          await prisma.abandonedCart.update({
            where: { id: abandoned.id },
            data: { reminder2Sent: true }
          });
          console.log(`[Cron] Sent 24-hour reminder to ${abandoned.customer.phone}`);
        }
      }

    } catch (error) {
      console.error('[Cron] Error in Abandoned Cart Check:', error);
    }
  });

  console.log('Abandoned Cart Cron Job initialized.');
};

module.exports = { initAbandonedCartCron };
