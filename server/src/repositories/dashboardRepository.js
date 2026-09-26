const prisma = require('../lib/prisma');
const stockLedgerRepository = require('./stockLedgerRepository');

class DashboardRepository {
  async getKpis() {
    // Total Stock across the entire business = sum of all stock_ledger quantity_change
    const totalStockResult = await prisma.stockLedger.aggregate({
      where: { deletedAt: null },
      _sum: { quantityChange: true },
    });
    const totalStock = totalStockResult._sum.quantityChange || 0;

    // Active products
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      select: { id: true, reorderLevel: true },
    });

    let lowStockCount = 0;
    let outOfStockCount = 0;

    // Check stock per product from ledger
    for (const p of products) {
      const stock = await stockLedgerRepository.getCurrentStock(p.id);
      if (stock <= 0) {
        outOfStockCount++;
      } else if (stock <= p.reorderLevel) {
        lowStockCount++;
      }
    }

    // Pending Receipts (Draft, Waiting, Ready)
    const pendingReceipts = await prisma.receipt.count({
      where: { status: { in: ['Draft', 'Waiting', 'Ready'] } },
    });

    // Pending Deliveries (Draft, Waiting, Ready)
    const pendingDeliveries = await prisma.deliveryOrder.count({
      where: { status: { in: ['Draft', 'Waiting', 'Ready'] } },
    });

    return {
      totalStock,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      totalProducts: products.length,
    };
  }

  async getTopLowStock(limit = 5) {
    const products = await prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true, uom: true },
    });

    const productsWithStock = await Promise.all(
      products.map(async (p) => {
        const currentStock = await stockLedgerRepository.getCurrentStock(p.id);
        const ratio = p.reorderLevel > 0 ? currentStock / p.reorderLevel : 1;
        
        let urgency = 'NORMAL';
        if (currentStock <= 0) urgency = 'CRITICAL';
        else if (currentStock <= p.reorderLevel * 0.5) urgency = 'HIGH';
        else if (currentStock <= p.reorderLevel) urgency = 'MEDIUM';

        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category?.name || 'General',
          uom: p.uom?.abbreviation || 'units',
          currentStock,
          reorderLevel: p.reorderLevel,
          ratio,
          urgency,
        };
      })
    );

    // Filter to items that are out of stock or low stock, sort by lowest ratio / current stock
    const lowStockItems = productsWithStock
      .filter((p) => p.currentStock <= p.reorderLevel)
      .sort((a, b) => a.ratio - b.ratio)
      .slice(0, limit);

    return lowStockItems;
  }

  async getActivityFeed(limit = 10) {
    // We can pull recent validated receipts, deliveries, transfers, adjustments, and audit log
    const auditLogs = await prisma.auditLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs.map((log) => ({
      id: log.id,
      user: log.user?.name || 'System User',
      action: log.action,
      tableName: log.tableName,
      recordId: log.recordId,
      timestamp: log.createdAt,
      details: log.newValues ? JSON.parse(log.newValues) : null,
    }));
  }
}

module.exports = new DashboardRepository();
