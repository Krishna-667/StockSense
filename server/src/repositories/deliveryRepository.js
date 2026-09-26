const prisma = require('../lib/prisma');

class DeliveryRepository {
  async getAll({ status, customerId, search, page = 1, limit = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = Number(customerId);

    if (search && search.trim() !== '') {
      where.OR = [
        { customer: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [deliveries, total] = await Promise.all([
      prisma.deliveryOrder.findMany({
        where,
        include: {
          customer: true,
          creator: { select: { id: true, name: true, email: true } },
          validator: { select: { id: true, name: true, email: true } },
          lines: {
            include: {
              product: { include: { uom: true } },
              location: { include: { warehouse: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.deliveryOrder.count({ where }),
    ]);

    return { deliveries, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  async getById(id) {
    return prisma.deliveryOrder.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
        validator: { select: { id: true, name: true, email: true } },
        lines: {
          include: {
            product: { include: { uom: true } },
            location: { include: { warehouse: true } },
          },
        },
      },
    });
  }

  async create(data, userId) {
    return prisma.deliveryOrder.create({
      data: {
        customerId: data.customerId ? Number(data.customerId) : null,
        status: data.status || 'Draft',
        notes: data.notes || null,
        createdBy: Number(userId),
        lines: {
          create: (data.lines || []).map((line) => ({
            productId: Number(line.productId),
            locationId: line.locationId ? Number(line.locationId) : null,
            requestedQty: Number(line.requestedQty || 0),
            deliveredQty: Number(line.deliveredQty !== undefined ? line.deliveredQty : line.requestedQty || 0),
          })),
        },
      },
      include: {
        customer: true,
        lines: {
          include: {
            product: { include: { uom: true } },
            location: { include: { warehouse: true } },
          },
        },
      },
    });
  }

  async update(id, data) {
    return prisma.$transaction(async (tx) => {
      if (data.lines) {
        await tx.deliveryLine.deleteMany({
          where: { deliveryId: Number(id) },
        });

        await tx.deliveryLine.createMany({
          data: data.lines.map((l) => ({
            deliveryId: Number(id),
            productId: Number(l.productId),
            locationId: l.locationId ? Number(l.locationId) : null,
            requestedQty: Number(l.requestedQty || 0),
            deliveredQty: Number(l.deliveredQty !== undefined ? l.deliveredQty : l.requestedQty || 0),
          })),
        });
      }

      return tx.deliveryOrder.update({
        where: { id: Number(id) },
        data: {
          customerId: data.customerId !== undefined ? (data.customerId ? Number(data.customerId) : null) : undefined,
          status: data.status !== undefined ? data.status : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          customer: true,
          lines: {
            include: {
              product: { include: { uom: true } },
              location: { include: { warehouse: true } },
            },
          },
        },
      });
    });
  }
}

module.exports = new DeliveryRepository();
