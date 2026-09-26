const prisma = require('../lib/prisma');
const stockLedgerRepository = require('./stockLedgerRepository');

class ProductRepository {
  async getAll({ search, categoryId, stockStatus, page = 1, limit = 50, warehouseId }) {
    const where = {
      deletedAt: null,
    };

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { sku: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        uom: true,
        reorderRules: {
          include: { warehouse: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Compute stock from ledger for all fetched products
    const productsWithStock = await Promise.all(
      products.map(async (prod) => {
        const currentStock = await stockLedgerRepository.getCurrentStock(prod.id, warehouseId);
        
        let computedStatus = 'IN_STOCK';
        if (currentStock <= 0) {
          computedStatus = 'OUT_OF_STOCK';
        } else if (currentStock <= prod.reorderLevel) {
          computedStatus = 'LOW_STOCK';
        }

        return {
          ...prod,
          currentStock,
          stockStatus: computedStatus,
        };
      })
    );

    let filtered = productsWithStock;
    if (stockStatus) {
      filtered = productsWithStock.filter((p) => p.stockStatus === stockStatus);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return {
      products: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id) {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: true,
        uom: true,
        reorderRules: {
          include: { warehouse: true },
        },
      },
    });

    if (!product || product.deletedAt) return null;

    const currentStock = await stockLedgerRepository.getCurrentStock(product.id);
    const stockBreakdown = await stockLedgerRepository.getStockBreakdown(product.id);

    let computedStatus = 'IN_STOCK';
    if (currentStock <= 0) {
      computedStatus = 'OUT_OF_STOCK';
    } else if (currentStock <= product.reorderLevel) {
      computedStatus = 'LOW_STOCK';
    }

    return {
      ...product,
      currentStock,
      stockStatus: computedStatus,
      stockBreakdown,
    };
  }

  async getBySku(sku) {
    return prisma.product.findFirst({
      where: {
        sku: { equals: sku },
        deletedAt: null,
      },
      include: { category: true, uom: true },
    });
  }

  async create(data) {
    return prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        uomId: data.uomId ? Number(data.uomId) : null,
        reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : 10,
        description: data.description || null,
      },
      include: {
        category: true,
        uom: true,
      },
    });
  }

  async update(id, data) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId !== undefined ? (data.categoryId ? Number(data.categoryId) : null) : undefined,
        uomId: data.uomId !== undefined ? (data.uomId ? Number(data.uomId) : null) : undefined,
        reorderLevel: data.reorderLevel !== undefined ? Number(data.reorderLevel) : undefined,
        description: data.description !== undefined ? data.description : undefined,
      },
      include: {
        category: true,
        uom: true,
      },
    });
  }

  async softDelete(id) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new ProductRepository();
