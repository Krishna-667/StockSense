const deliveryRepository = require('../repositories/deliveryRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const dashboardRepository = require('../repositories/dashboardRepository');
const prisma = require('../lib/prisma');
const {
  emitStockUpdated,
  emitKpiUpdated,
  emitActivityNew,
  emitNotificationNew,
} = require('../sockets');

class DeliveryService {
  async getDeliveries(params) {
    return deliveryRepository.getAll(params);
  }

  async getDeliveryById(id) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
      const error = new Error('Delivery order not found');
      error.statusCode = 404;
      throw error;
    }
    return delivery;
  }

  async createDelivery(data, userId) {
    const delivery = await deliveryRepository.create(data, userId);
    return deliveryRepository.getById(delivery.id);
  }

  async updateDelivery(id, data, userId) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
      const error = new Error('Delivery order not found');
      error.statusCode = 404;
      throw error;
    }

    if (delivery.status === 'Done') {
      const error = new Error('Cannot edit a validated delivery order');
      error.statusCode = 400;
      throw error;
    }

    if (delivery.status === 'Cancelled') {
      const error = new Error('Cannot edit a cancelled delivery order');
      error.statusCode = 400;
      throw error;
    }

    const updated = await deliveryRepository.update(id, data);
    return deliveryRepository.getById(updated.id);
  }

  async validateDelivery(id, user) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
      const error = new Error('Delivery order not found');
      error.statusCode = 404;
      throw error;
    }

    if (delivery.status === 'Done') {
      const error = new Error('This delivery order has already been validated');
      error.statusCode = 400;
      throw error;
    }

    if (delivery.status === 'Cancelled') {
      const error = new Error('Cannot validate a cancelled delivery order');
      error.statusCode = 400;
      throw error;
    }

    if (!delivery.lines || delivery.lines.length === 0) {
      const error = new Error('Cannot validate a delivery order with no line items');
      error.statusCode = 400;
      throw error;
    }

    // Check available stock at specified location or overall product stock
    for (const line of delivery.lines) {
      const qtyToDeliver = line.deliveredQty > 0 ? line.deliveredQty : line.requestedQty;
      const currentStock = await stockLedgerRepository.getCurrentStock(
        line.productId,
        null,
        line.locationId
      );

      if (currentStock < qtyToDeliver) {
        const error = new Error(
          `Insufficient stock at selected location for product "${line.product.name}". Available: ${currentStock}, Required: ${qtyToDeliver}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    // Execute atomic transaction for validation and stock ledger entries
    const validatedDelivery = await prisma.$transaction(async (tx) => {
      // 1. Update status to Done
      const updated = await tx.deliveryOrder.update({
        where: { id: Number(id) },
        data: {
          status: 'Done',
          validatedBy: user.id,
          validatedAt: new Date(),
        },
      });

      // 2. Insert negative stock ledger entries for each delivered line
      for (const line of delivery.lines) {
        const qty = line.deliveredQty > 0 ? line.deliveredQty : line.requestedQty;
        if (qty <= 0) continue;

        let warehouseId = null;
        if (line.locationId) {
          const loc = await tx.location.findUnique({ where: { id: line.locationId } });
          warehouseId = loc ? loc.warehouseId : null;
        }

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            warehouseId,
            locationId: line.locationId,
            operationType: 'DELIVERY',
            quantityChange: -qty, // Negative reduction!
            referenceId: Number(id),
            referenceType: 'delivery',
            notes: `Outbound delivery #${id} for ${delivery.customer?.name || 'Customer'}`,
            createdBy: user.id,
          },
        });
      }

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'VALIDATE_DELIVERY',
          tableName: 'delivery_orders',
          recordId: Number(id),
          newValues: JSON.stringify({ status: 'Done', validatedBy: user.name }),
        },
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: delivery.createdBy || user.id,
          title: `Delivery #${id} Validated`,
          message: `${user.name} validated outbound delivery for ${delivery.customer?.name || 'Customer'}. Stock decreased.`,
          type: 'info',
          referenceId: Number(id),
          referenceType: 'delivery',
        },
      });

      return updated;
    });

    // Real-time WebSocket broadcasting
    try {
      for (const line of delivery.lines) {
        const newTotal = await stockLedgerRepository.getCurrentStock(line.productId);
        emitStockUpdated({ productId: line.productId, newTotal });
      }

      const kpis = await dashboardRepository.getKpis();
      emitKpiUpdated(kpis);

      emitActivityNew({
        user: user.name,
        action: `validated Delivery #${id}`,
        reference: `Delivery #${id}`,
        timestamp: new Date().toISOString(),
      });

      emitNotificationNew({
        title: `Delivery #${id} Validated`,
        message: `${user.name} validated delivery order #${id}.`,
        type: 'info',
      });
    } catch (socketErr) {
      console.error('Socket emission error:', socketErr.message);
    }

    return deliveryRepository.getById(id);
  }

  async cancelDelivery(id, userId) {
    const delivery = await deliveryRepository.getById(id);
    if (!delivery) {
      const error = new Error('Delivery order not found');
      error.statusCode = 404;
      throw error;
    }

    if (delivery.status === 'Done') {
      const error = new Error('Cannot cancel an already validated delivery order');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.deliveryOrder.update({
      where: { id: Number(id) },
      data: { status: 'Cancelled' },
    });

    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'CANCEL_DELIVERY',
        tableName: 'delivery_orders',
        recordId: Number(id),
      },
    });

    return deliveryRepository.getById(id);
  }
}

module.exports = new DeliveryService();
