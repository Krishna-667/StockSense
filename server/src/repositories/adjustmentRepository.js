const prisma = require('../lib/prisma');

class AdjustmentRepository {
  async getAll({ status, warehouseId, page = 1, limit = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (warehouseId) where.warehouseId = Number(warehouseId);

    const skip = (page - 1) * limit;

    const [adjustments, total] = await Promise.all([
      prisma.adjustment.findMany({
        where,
        include: {
          warehouse: true,
          location: true,
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
      prisma.adjustment.count({ where }),
    ]);

    return { adjustments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getById(id) {
    return prisma.adjustment.findUnique({
      where: { id: Number(id) },
      include: {
        warehouse: true,
        location: true,
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
    return prisma.adjustment.create({
      data: {
        warehouseId: data.warehouseId ? Number(data.warehouseId) : null,
        locationId: data.locationId ? Number(data.locationId) : null,
        status: data.status || 'Draft',
        reason: data.reason || null,
        notes: data.notes || null,
        createdBy: Number(userId),
        lines: {
          create: (data.lines || []).map((l) => ({
            productId: Number(l.productId),
            recordedQty: Number(l.recordedQty || 0),
            physicalQty: Number(l.physicalQty || 0),
            deltaQty: Number(l.physicalQty || 0) - Number(l.recordedQty || 0),
          })),
        },
      },
      include: {
        warehouse: true,
        location: true,
        lines: {
          include: {
            product: { include: { uom: true } },
          },
        },
      },
    });
  }
}

module.exports = new AdjustmentRepository();
