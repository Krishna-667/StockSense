const prisma = require('../lib/prisma');

class ReceiptRepository {
  async getAll({ status, supplierId, search, page = 1, limit = 20 }) {
    const where = {};
    if (status) where.status = status;
    if (supplierId) where.supplierId = Number(supplierId);

    if (search && search.trim() !== '') {
      where.OR = [
        { supplier: { name: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    const [receipts, total] = await Promise.all([
      prisma.receipt.findMany({
        where,
        include: {
          supplier: true,
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
      prisma.receipt.count({ where }),
    ]);

    return { receipts, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
  }

  async getById(id) {
    return prisma.receipt.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
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
    return prisma.receipt.create({
      data: {
        supplierId: data.supplierId ? Number(data.supplierId) : null,
        status: data.status || 'Draft',
        notes: data.notes || null,
        createdBy: Number(userId),
        lines: {
          create: (data.lines || []).map((line) => ({
            productId: Number(line.productId),
            locationId: line.locationId ? Number(line.locationId) : null,
            expectedQty: Number(line.expectedQty || 0),
            receivedQty: Number(line.receivedQty !== undefined ? line.receivedQty : line.expectedQty || 0),
          })),
        },
      },
      include: {
        supplier: true,
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
    // If lines are updated, delete existing and re-create them
    return prisma.$transaction(async (tx) => {
      if (data.lines) {
        await tx.receiptLine.deleteMany({
          where: { receiptId: Number(id) },
        });

        await tx.receiptLine.createMany({
          data: data.lines.map((l) => ({
            receiptId: Number(id),
            productId: Number(l.productId),
            locationId: l.locationId ? Number(l.locationId) : null,
            expectedQty: Number(l.expectedQty || 0),
            receivedQty: Number(l.receivedQty !== undefined ? l.receivedQty : l.expectedQty || 0),
          })),
        });
      }

      return tx.receipt.update({
        where: { id: Number(id) },
        data: {
          supplierId: data.supplierId !== undefined ? (data.supplierId ? Number(data.supplierId) : null) : undefined,
          status: data.status !== undefined ? data.status : undefined,
          notes: data.notes !== undefined ? data.notes : undefined,
        },
        include: {
          supplier: true,
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

module.exports = new ReceiptRepository();
