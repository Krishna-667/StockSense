const prisma = require('../lib/prisma');

class TransferRepository {
  async getAll({ status, fromWarehouseId, toWarehouseId, page = 1, limit = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (fromWarehouseId) where.fromWarehouseId = Number(fromWarehouseId);
    if (toWarehouseId) where.toWarehouseId = Number(toWarehouseId);

    const skip = (page - 1) * limit;

    const [transfers, total] = await Promise.all([
      prisma.transfer.findMany({
        where,
        include: {
          fromWarehouse: true,
          toWarehouse: true,
          fromLocation: true,
          toLocation: true,
          creator: { select: { id: true, name: true, email: true } },
          validator: { select: { id: true, name: true, email: true } },
          lines: {
            include: {
              product: { include: { uom: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transfer.count({ where }),
    ]);

    return { transfers, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id) {
    return prisma.transfer.findUnique({
      where: { id: Number(id) },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        fromLocation: true,
        toLocation: true,
        creator: { select: { id: true, name: true, email: true } },
        validator: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: { include: { uom: true } },
          },
        },
      },
    });
  }

  async create(data, userId) {
    return prisma.transfer.create({
      data: {
        fromWarehouseId: data.fromWarehouseId ? Number(data.fromWarehouseId) : null,
        toWarehouseId: data.toWarehouseId ? Number(data.toWarehouseId) : null,
        fromLocationId: data.fromLocationId ? Number(data.fromLocationId) : null,
        toLocationId: data.toLocationId ? Number(data.toLocationId) : null,
        status: data.status || 'Draft',
        notes: data.notes || null,
        createdBy: Number(userId),
        lines: {
          create: (data.lines || []).map((l) => ({
            productId: Number(l.productId),
            quantity: Number(l.quantity),
          })),
        },
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        lines: {
          include: {
            product: { include: { uom: true } },
          },
        },
      },
    });
  }
}

module.exports = new TransferRepository();
