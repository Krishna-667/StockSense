const prisma = require('../lib/prisma');

class StockLedgerRepository {
  /**
   * Sum of all ledger entries for a product, optionally filtered by warehouse and/or location
   */
  async getCurrentStock(productId, warehouseId = null, locationId = null, tx = prisma) {
    const where = {
      productId: Number(productId),
      deletedAt: null,
    };

    if (warehouseId) {
      where.warehouseId = Number(warehouseId);
    }
    if (locationId) {
      where.locationId = Number(locationId);
    }

    const result = await tx.stockLedger.aggregate({
      where,
      _sum: {
        quantityChange: true,
      },
    });

    return result._sum.quantityChange || 0;
  }

  /**
   * Get stock breakdown grouped by warehouse and location for a product
   */
  async getStockBreakdown(productId) {
    const ledgers = await prisma.stockLedger.findMany({
      where: {
        productId: Number(productId),
        deletedAt: null,
      },
      include: {
        warehouse: true,
        location: true,
      },
    });

    const warehouseMap = {};

    ledgers.forEach((entry) => {
      const whId = entry.warehouseId || 0;
      const whName = entry.warehouse?.name || 'Unassigned Warehouse';

      if (!warehouseMap[whId]) {
        warehouseMap[whId] = {
          warehouseId: whId,
          warehouseName: whName,
          totalStock: 0,
          locations: {},
        };
      }

      warehouseMap[whId].totalStock += entry.quantityChange;

      if (entry.locationId) {
        const locId = entry.locationId;
        const locName = entry.location?.name || `Location #${locId}`;
        const aisle = entry.location?.aisle || '';
        const rack = entry.location?.rack || '';
        const shelf = entry.location?.shelf || '';

        if (!warehouseMap[whId].locations[locId]) {
          warehouseMap[whId].locations[locId] = {
            locationId: locId,
            locationName: locName,
            aisle,
            rack,
            shelf,
            stock: 0,
          };
        }

        warehouseMap[whId].locations[locId].stock += entry.quantityChange;
      }
    });

    // Format as list
    return Object.values(warehouseMap).map((wh) => ({
      ...wh,
      locations: Object.values(wh.locations),
    }));
  }

  /**
   * Create single immutable stock ledger entry
   */
  async createEntry(data, tx = prisma) {
    return tx.stockLedger.create({
      data: {
        productId: Number(data.productId),
        warehouseId: data.warehouseId ? Number(data.warehouseId) : null,
        locationId: data.locationId ? Number(data.locationId) : null,
        operationType: data.operationType, // RECEIPT, DELIVERY, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
        quantityChange: Number(data.quantityChange),
        referenceId: data.referenceId ? Number(data.referenceId) : null,
        referenceType: data.referenceType,
        notes: data.notes || null,
        createdBy: data.createdBy ? Number(data.createdBy) : null,
      },
      include: {
        product: true,
        warehouse: true,
        location: true,
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Create multiple stock ledger entries in a single batch
   */
  async createMany(entries, tx = prisma) {
    return tx.stockLedger.createMany({
      data: entries.map((entry) => ({
        productId: Number(entry.productId),
        warehouseId: entry.warehouseId ? Number(entry.warehouseId) : null,
        locationId: entry.locationId ? Number(entry.locationId) : null,
        operationType: entry.operationType,
        quantityChange: Number(entry.quantityChange),
        referenceId: entry.referenceId ? Number(entry.referenceId) : null,
        referenceType: entry.referenceType,
        notes: entry.notes || null,
        createdBy: entry.createdBy ? Number(entry.createdBy) : null,
        createdAt: entry.createdAt || new Date(),
      })),
    });
  }

  /**
   * Auto-seed demo dataset if database has zero ledger entries
   */
  async ensureSeedData() {
    try {
      const count = await prisma.stockLedger.count();
      if (count === 0) {
        const seedMain = require('../../prisma/seed');
        if (typeof seedMain === 'function') {
          console.log('🌱 Stock ledger empty: auto-seeding initial demo transactions...');
          await seedMain();
        }
      }
    } catch (err) {
      console.warn('⚠️ Auto-seed check notice:', err.message);
    }
  }

  /**
   * Query filtered ledger entries
   */
  async getLedgerEntries({
    startDate,
    endDate,
    productId,
    warehouseId,
    operationType,
    page = 1,
    limit = 50,
  }) {
    await this.ensureSeedData();

    const where = { deletedAt: null };

    if (productId) where.productId = Number(productId);
    if (warehouseId) where.warehouseId = Number(warehouseId);
    if (operationType) where.operationType = operationType;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      prisma.stockLedger.findMany({
        where,
        include: {
          product: {
            select: { id: true, name: true, sku: true, uom: true },
          },
          warehouse: {
            select: { id: true, name: true },
          },
          location: {
            select: { id: true, name: true, aisle: true, rack: true, shelf: true },
          },
          creator: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.stockLedger.count({ where }),
    ]);

    return { entries, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  /**
   * Product specific movement history
   */
  async getLedgerForProduct(productId, limit = 50) {
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    return prisma.stockLedger.findMany({
      where: {
        productId: Number(productId),
        deletedAt: null,
      },
      include: {
        warehouse: true,
        location: true,
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
    });
  }

  /**
   * Daily aggregated movements for charts (last N days)
   */
  async getMovementChartData(days = 7) {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - days);
    sinceDate.setHours(0, 0, 0, 0);

    const entries = await prisma.stockLedger.findMany({
      where: {
        createdAt: { gte: sinceDate },
        deletedAt: null,
      },
      select: {
        operationType: true,
        quantityChange: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by Day (YYYY-MM-DD)
    const dayMap = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(sinceDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dayMap[key] = {
        date: key,
        label: displayLabel,
        inbound: 0,
        outbound: 0,
        transfers: 0,
        adjustments: 0,
      };
    }

    entries.forEach((e) => {
      const key = e.createdAt.toISOString().split('T')[0];
      if (dayMap[key]) {
        if (e.operationType === 'RECEIPT') {
          dayMap[key].inbound += Math.abs(e.quantityChange);
        } else if (e.operationType === 'DELIVERY') {
          dayMap[key].outbound += Math.abs(e.quantityChange);
        } else if (e.operationType.startsWith('TRANSFER')) {
          if (e.quantityChange > 0) {
            dayMap[key].transfers += Math.abs(e.quantityChange);
          }
        } else if (e.operationType === 'ADJUSTMENT') {
          dayMap[key].adjustments += Math.abs(e.quantityChange);
        }
      }
    });

    return Object.values(dayMap);
  }

  /**
   * Compute average 30-day burn rate per product
   */
  async get30DayConsumption() {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 30);

    const outboundEntries = await prisma.stockLedger.findMany({
      where: {
        createdAt: { gte: sinceDate },
        deletedAt: null,
        operationType: { in: ['DELIVERY', 'TRANSFER_OUT'] },
        quantityChange: { lt: 0 },
      },
      select: {
        productId: true,
        quantityChange: true,
      },
    });

    const consumptionMap = {};
    outboundEntries.forEach((entry) => {
      const qty = Math.abs(entry.quantityChange);
      consumptionMap[entry.productId] = (consumptionMap[entry.productId] || 0) + qty;
    });

    return consumptionMap;
  }
}

module.exports = new StockLedgerRepository();
