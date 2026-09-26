const transferRepository = require('../repositories/transferRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const dashboardRepository = require('../repositories/dashboardRepository');
const prisma = require('../lib/prisma');
const {
  emitStockUpdated,
  emitKpiUpdated,
  emitActivityNew,
  emitNotificationNew,
} = require('../sockets');

class TransferService {
  async getTransfers(params) {
    return transferRepository.getAll(params);
  }

  async getTransferById(id) {
    const transfer = await transferRepository.getById(id);
    if (!transfer) {
      const error = new Error('Transfer not found');
      error.statusCode = 404;
      throw error;
    }
    return transfer;
  }

  async createTransfer(data, userId) {
    const transfer = await transferRepository.create(data, userId);
    return transferRepository.getById(transfer.id);
  }

  async validateTransfer(id, user) {
    const transfer = await transferRepository.getById(id);
    if (!transfer) {
      const error = new Error('Transfer not found');
      error.statusCode = 404;
      throw error;
    }

    if (transfer.status === 'Done') {
      const error = new Error('This transfer has already been completed');
      error.statusCode = 400;
      throw error;
    }

    if (!transfer.lines || transfer.lines.length === 0) {
      const error = new Error('Cannot validate a transfer with no lines');
      error.statusCode = 400;
      throw error;
    }

    // Verify source stock for each transfer line
    for (const line of transfer.lines) {
      const sourceStock = await stockLedgerRepository.getCurrentStock(
        line.productId,
        transfer.fromWarehouseId,
        transfer.fromLocationId
      );

      if (sourceStock < line.quantity) {
        const error = new Error(
          `Insufficient stock at source for "${line.product.name}". Available: ${sourceStock}, Requested transfer: ${line.quantity}`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const completed = await prisma.$transaction(async (tx) => {
      // 1. Update transfer status
      const updated = await tx.transfer.update({
        where: { id: Number(id) },
        data: {
          status: 'Done',
          validatedBy: user.id,
          validatedAt: new Date(),
        },
      });

      // 2. Insert double-entry ledger records
      for (const line of transfer.lines) {
        // Source outflow
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            warehouseId: transfer.fromWarehouseId,
            locationId: transfer.fromLocationId,
            operationType: 'TRANSFER_OUT',
            quantityChange: -line.quantity,
            referenceId: Number(id),
            referenceType: 'transfer',
            notes: `Transfer #${id} to ${transfer.toWarehouse?.name || 'Destination'}`,
            createdBy: user.id,
          },
        });

        // Destination inflow
        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            warehouseId: transfer.toWarehouseId,
            locationId: transfer.toLocationId,
            operationType: 'TRANSFER_IN',
            quantityChange: line.quantity,
            referenceId: Number(id),
            referenceType: 'transfer',
            notes: `Transfer #${id} from ${transfer.fromWarehouse?.name || 'Origin'}`,
            createdBy: user.id,
          },
        });
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'VALIDATE_TRANSFER',
          tableName: 'transfers',
          recordId: Number(id),
          newValues: JSON.stringify({ status: 'Done', validatedBy: user.name }),
        },
      });

      return updated;
    });

    // Real-time broadcasts
    try {
      for (const line of transfer.lines) {
        const newTotal = await stockLedgerRepository.getCurrentStock(line.productId);
        emitStockUpdated({ productId: line.productId, newTotal });
      }

      const kpis = await dashboardRepository.getKpis();
      emitKpiUpdated(kpis);

      emitActivityNew({
        user: user.name,
        action: `validated Transfer #${id}`,
        reference: `Transfer #${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      console.error('Socket emission error:', socketErr.message);
    }

    return transferRepository.getById(id);
  }
}

module.exports = new TransferService();
