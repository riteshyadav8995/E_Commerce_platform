const prisma = require('../utils/prisma');

// ─── GET /api/inventory ────────────────────────────────────────────────────────
// Returns all inventory rows, enriched with product + category info.
// Query: ?lowStock=true  → only items below minStockThreshold
const getAllInventory = async (req, res) => {
  try {
    const { lowStock } = req.query;

    const inventory = await prisma.inventory.findMany({
      include: {
        product: {
          include: { category: { select: { id: true, name: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = inventory.map((inv) => ({
      ...inv,
      isLowStock: inv.quantity <= inv.minStockThreshold,
    }));

    const filtered =
      lowStock === 'true' ? result.filter((inv) => inv.isLowStock) : result;

    res.json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/inventory/:productId ────────────────────────────────────────────
const getInventoryByProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);

    const inv = await prisma.inventory.findFirst({
      where: { productId },
      include: {
        product: { include: { category: { select: { id: true, name: true } } } },
      },
    });

    if (!inv) {
      return res.status(404).json({ message: 'Inventory record not found for this product' });
    }

    res.json({ ...inv, isLowStock: inv.quantity <= inv.minStockThreshold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── POST /api/inventory/initialize ───────────────────────────────────────────
// Creates the inventory record for a product (if it doesn't already exist).
const initializeInventory = async (req, res) => {
  try {
    const { productId, quantity = 0, purchasePrice = 0, minStockThreshold = 5 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existing = await prisma.inventory.findFirst({
      where: { productId: parseInt(productId) },
    });
    if (existing) {
      return res.status(400).json({ message: 'Inventory already exists for this product' });
    }

    let warehouse = await prisma.warehouse.findFirst();
    if (!warehouse) {
      warehouse = await prisma.warehouse.create({ data: { name: 'Main Warehouse' } });
    }

    const inv = await prisma.inventory.create({
      data: {
        productId: parseInt(productId),
        warehouseId: warehouse.id,
        quantity: parseInt(quantity),
        purchasePrice: parseFloat(purchasePrice),
        minStockThreshold: parseInt(minStockThreshold),
      },
      include: { product: true },
    });

    // Record the opening stock as a transaction
    if (parseInt(quantity) > 0) {
      await prisma.stockTransaction.create({
        data: {
          inventoryId: inv.id,
          type: 'IN',
          quantity: parseInt(quantity),
          reason: 'Opening stock',
          userId: req.user?.id || null,
        },
      });
    }

    res.status(201).json(inv);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/inventory/:productId/adjust ─────────────────────────────────────
// Adjusts the stock for a given product. type: "IN" | "OUT" | "ADJUSTMENT"
const adjustStock = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { type, quantity, reason, purchasePrice, minStockThreshold } = req.body;

    if (!type || quantity === undefined) {
      return res.status(400).json({ message: 'type and quantity are required' });
    }
    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({ message: 'type must be IN, OUT, or ADJUSTMENT' });
    }

    const inv = await prisma.inventory.findFirst({ where: { productId } });
    if (!inv) {
      return res.status(404).json({ message: 'Inventory not found for this product. Initialize it first.' });
    }

    const qty = parseInt(quantity);

    let newQuantity = inv.quantity;
    if (type === 'IN') {
      newQuantity = inv.quantity + qty;
    } else if (type === 'OUT') {
      if (qty > inv.quantity) {
        return res.status(400).json({ message: `Insufficient stock. Available: ${inv.quantity}` });
      }
      newQuantity = inv.quantity - qty;
    } else if (type === 'ADJUSTMENT') {
      newQuantity = qty; // direct set
    }

    // Build update payload
    const updateData = { quantity: newQuantity };
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice);
    if (minStockThreshold !== undefined) updateData.minStockThreshold = parseInt(minStockThreshold);

    const [updatedInv] = await prisma.$transaction([
      prisma.inventory.update({
        where: { id: inv.id },
        data: updateData,
        include: {
          product: { include: { category: { select: { id: true, name: true } } } },
        },
      }),
      prisma.stockTransaction.create({
        data: {
          inventoryId: inv.id,
          type,
          quantity: qty,
          reason: reason || null,
          userId: req.user?.id || null,
        },
      }),
    ]);

    // Check low stock and notify admin
    const { checkAndNotifyLowStock } = require('../services/inventoryService');
    await checkAndNotifyLowStock(inv.id);

    res.json({ ...updatedInv, isLowStock: newQuantity <= updatedInv.minStockThreshold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/inventory/:productId/history ────────────────────────────────────
const getStockHistory = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const inv = await prisma.inventory.findFirst({ where: { productId } });
    if (!inv) {
      return res.status(404).json({ message: 'Inventory not found for this product' });
    }

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where: { inventoryId: inv.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
        include: { user: { select: { id: true, name: true } } },
      }),
      prisma.stockTransaction.count({ where: { inventoryId: inv.id } }),
    ]);

    res.json({ transactions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── PUT /api/inventory/:productId ────────────────────────────────────────────
// Update inventory settings (purchasePrice, minStockThreshold) without affecting quantity
const updateInventorySettings = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const { purchasePrice, minStockThreshold } = req.body;

    const inv = await prisma.inventory.findFirst({ where: { productId } });
    if (!inv) {
      return res.status(404).json({ message: 'Inventory not found' });
    }

    const updated = await prisma.inventory.update({
      where: { id: inv.id },
      data: {
        ...(purchasePrice !== undefined && { purchasePrice: parseFloat(purchasePrice) }),
        ...(minStockThreshold !== undefined && { minStockThreshold: parseInt(minStockThreshold) }),
      },
      include: { product: { include: { category: { select: { id: true, name: true } } } } },
    });

    res.json({ ...updated, isLowStock: updated.quantity <= updated.minStockThreshold });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllInventory,
  getInventoryByProduct,
  initializeInventory,
  adjustStock,
  getStockHistory,
  updateInventorySettings,
};
