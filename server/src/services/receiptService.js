const receiptRepository = require('../repositories/receiptRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const dashboardRepository = require('../repositories/dashboardRepository');
const prisma = require('../lib/prisma');
const {
  emitStockUpdated,
  emitKpiUpdated,
  emitActivityNew,
  emitNotificationNew,
} = require('../sockets');

class ReceiptService {
  async getReceipts(params) {
    return receiptRepository.getAll(params);
  }

  async getReceiptById(id) {
    const receipt = await receiptRepository.getById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }
    return receipt;
  }

  async createReceipt(data, userId) {
    const receipt = await receiptRepository.create(data, userId);
    return receiptRepository.getById(receipt.id);
  }

  async updateReceipt(id, data, userId) {
    const receipt = await receiptRepository.getById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'Done') {
      const error = new Error('Cannot edit a validated receipt');
      error.statusCode = 400;
      throw error;
    }

    if (receipt.status === 'Cancelled') {
      const error = new Error('Cannot edit a cancelled receipt');
      error.statusCode = 400;
      throw error;
    }

    const updated = await receiptRepository.update(id, data);
    return receiptRepository.getById(updated.id);
  }

  async validateReceipt(id, user) {
    const receipt = await receiptRepository.getById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'Done') {
      const error = new Error('This receipt has already been validated');
      error.statusCode = 400;
      throw error;
    }

    if (receipt.status === 'Cancelled') {
      const error = new Error('Cannot validate a cancelled receipt');
      error.statusCode = 400;
      throw error;
    }

    if (!receipt.lines || receipt.lines.length === 0) {
      const error = new Error('Cannot validate a receipt with no line items');
      error.statusCode = 400;
      throw error;
    }

    // Execute atomic transaction for validation and stock ledger entries
    const validatedReceipt = await prisma.$transaction(async (tx) => {
      // 1. Update receipt status to Done
      const updated = await tx.receipt.update({
        where: { id: Number(id) },
        data: {
          status: 'Done',
          validatedBy: user.id,
          validatedAt: new Date(),
        },
      });

      // 2. Insert stock ledger entries for each line item
      for (const line of receipt.lines) {
        const qty = line.receivedQty > 0 ? line.receivedQty : line.expectedQty;
        if (qty <= 0) continue;

        // Determine warehouse from location if available
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
            operationType: 'RECEIPT',
            quantityChange: qty, // Positive increase!
            referenceId: Number(id),
            referenceType: 'receipt',
            notes: `Receipt #${id} from ${receipt.supplier?.name || 'Vendor'}`,
            createdBy: user.id,
          },
        });
      }

      // 3. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'VALIDATE_RECEIPT',
          tableName: 'receipts',
          recordId: Number(id),
          newValues: JSON.stringify({ status: 'Done', validatedBy: user.name }),
        },
      });

      // 4. Create Notification
      await tx.notification.create({
        data: {
          userId: receipt.createdBy || user.id,
          title: `Receipt #${id} Validated`,
          message: `${user.name} validated incoming receipt from ${receipt.supplier?.name || 'Supplier'}. Stock has been updated.`,
          type: 'success',
          referenceId: Number(id),
          referenceType: 'receipt',
        },
      });

      return updated;
    });

    // Real-time WebSocket broadcasting
    try {
      // Broadcast stock updates for affected products
      for (const line of receipt.lines) {
        const newTotal = await stockLedgerRepository.getCurrentStock(line.productId);
        emitStockUpdated({ productId: line.productId, newTotal });
      }

      // Broadcast fresh KPIs
      const kpis = await dashboardRepository.getKpis();
      emitKpiUpdated(kpis);

      // Broadcast activity
      emitActivityNew({
        user: user.name,
        action: `validated Receipt #${id}`,
        reference: `Receipt #${id}`,
        timestamp: new Date().toISOString(),
      });

      // Broadcast notification
      emitNotificationNew({
        title: `Receipt #${id} Validated`,
        message: `${user.name} validated incoming receipt #${id}.`,
        type: 'success',
      });
    } catch (socketErr) {
      console.error('Socket emission error:', socketErr.message);
    }

    return receiptRepository.getById(id);
  }

  async cancelReceipt(id, userId) {
    const receipt = await receiptRepository.getById(id);
    if (!receipt) {
      const error = new Error('Receipt not found');
      error.statusCode = 404;
      throw error;
    }

    if (receipt.status === 'Done') {
      const error = new Error('Cannot cancel an already validated receipt');
      error.statusCode = 400;
      throw error;
    }

    const updated = await prisma.receipt.update({
      where: { id: Number(id) },
      data: { status: 'Cancelled' },
    });

    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'CANCEL_RECEIPT',
        tableName: 'receipts',
        recordId: Number(id),
      },
    });

    return receiptRepository.getById(id);
  }
}

module.exports = new ReceiptService();
