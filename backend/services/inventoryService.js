const prisma = require('../utils/prisma');
const { sendEmail } = require('./emailService');

const checkAndNotifyLowStock = async (inventoryId) => {
  try {
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: { product: true, warehouse: true }
    });

    if (!inventory) return;

    if (inventory.quantity <= inventory.minStockThreshold) {
      const title = `Low Stock Alert: ${inventory.product.name}`;
      const message = `Stock for ${inventory.product.name} (SKU: ${inventory.product.sku}) in warehouse ${inventory.warehouse.name} has dropped to ${inventory.quantity}. Minimum threshold is ${inventory.minStockThreshold}.`;

      // Create Notification
      await prisma.notification.create({
        data: {
          title,
          message,
          link: '/inventory'
        }
      });

      // Send Email to Admin
      // Fallback to process.env.EMAIL_USER if no other admin email is specified
      const adminEmail = process.env.EMAIL_USER;
      if (adminEmail) {
        await sendEmail({
          to: adminEmail,
          subject: title,
          text: message,
          html: `<p><strong>${title}</strong></p><p>${message}</p><p><a href="http://localhost:5173/inventory">Click here to manage inventory</a></p>`
        });
      }
    }
  } catch (error) {
    console.error('Error in checkAndNotifyLowStock:', error);
  }
};

module.exports = { checkAndNotifyLowStock };
