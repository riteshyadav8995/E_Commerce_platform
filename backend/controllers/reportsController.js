const prisma = require('../utils/prisma');

// ─── GET /api/reports/dashboard ───────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper to sum grandTotal for a date range
    async function revenue(from) {
      const result = await prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: from } },
        _sum: { grandTotal: true },
        _count: { id: true },
      });
      return {
        revenue: parseFloat(result._sum.grandTotal || 0),
        count: result._count.id,
      };
    }

    const [today, week, month, totalStats] = await Promise.all([
      revenue(todayStart),
      revenue(weekStart),
      revenue(monthStart),
      revenue(new Date(0)),
    ]);

    // Top 5 products by qty sold (paid bills only)
    const topProductsRaw = await prisma.billItem.groupBy({
      by: ['productId'],
      where: { bill: { status: 'PAID' } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductIds = topProductsRaw.map((r) => r.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, imageUrl: true },
    });

    const topProducts = topProductsRaw.map((r) => {
      const product = topProductDetails.find((p) => p.id === r.productId);
      return {
        productId: r.productId,
        name: product?.name || 'Unknown',
        imageUrl: product?.imageUrl || null,
        totalQty: r._sum.quantity,
        totalRevenue: parseFloat(r._sum.subtotal || 0),
      };
    });

    // Revenue by category
    const categoryRevenueRaw = await prisma.billItem.findMany({
      where: { bill: { status: 'PAID' } },
      include: { product: { select: { category: { select: { id: true, name: true } } } } },
    });

    const categoryMap = {};
    for (const item of categoryRevenueRaw) {
      const cat = item.product.category;
      if (!cat) continue;
      if (!categoryMap[cat.id]) {
        categoryMap[cat.id] = { categoryId: cat.id, name: cat.name, revenue: 0, quantity: 0 };
      }
      categoryMap[cat.id].revenue += parseFloat(item.subtotal);
      categoryMap[cat.id].quantity += item.quantity;
    }
    const categoryRevenue = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    // Revenue last 7 days (for sparkline / chart)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const agg = await prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: dayStart, lte: dayEnd } },
        _sum: { grandTotal: true },
        _count: { id: true },
      });
      dailyRevenue.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: parseFloat(agg._sum.grandTotal || 0),
        bills: agg._count.id,
      });
    }

    // Low stock count
    const allInventory = await prisma.inventory.findMany({
      select: { quantity: true, minStockThreshold: true },
    });
    const lowStockCount = allInventory.filter(
      (inv) => inv.quantity <= inv.minStockThreshold
    ).length;

    // Total products & categories
    const [totalProducts, totalCategories] = await Promise.all([
      prisma.product.count({ where: { status: 'active' } }),
      prisma.category.count(),
    ]);

    res.json({
      today,
      week,
      month,
      total: totalStats,
      topProducts,
      categoryRevenue,
      dailyRevenue,
      lowStockCount,
      totalProducts,
      totalCategories,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── GET /api/reports/ai-summary ──────────────────────────────────────────────
const getAiSummary = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [monthRevenue, totalProducts, lowStock] = await Promise.all([
      prisma.bill.aggregate({
        where: { status: 'PAID', createdAt: { gte: monthStart } },
        _sum: { grandTotal: true },
        _count: { id: true },
      }),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.inventory.findMany({ select: { quantity: true, minStockThreshold: true } }),
    ]);

    const lowStockCount = lowStock.filter((inv) => inv.quantity <= inv.minStockThreshold).length;

    const topProductsRaw = await prisma.billItem.groupBy({
      by: ['productId'],
      where: { bill: { status: 'PAID' } },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 3,
    });

    const stats = {
      thisMonthRevenue: parseFloat(monthRevenue._sum.grandTotal || 0),
      thisMonthOrders: monthRevenue._count.id,
      totalActiveProducts: totalProducts,
      lowStockWarnings: lowStockCount,
      top3ProductsByQuantitySold: topProductsRaw.map(r => ({ productId: r.productId, qtySold: r._sum.quantity })),
    };

    const { generateExecutiveSummary } = require('../services/aiService');
    const summary = await generateExecutiveSummary(stats);
    
    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardStats, getAiSummary };
