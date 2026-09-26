const adjustmentRepository = require('../repositories/adjustmentRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const dashboardRepository = require('../repositories/dashboardRepository');
const prisma = require('../lib/prisma');
const {
  emitStockUpdated,
  emitKpiUpdated,
  emitActivityNew,
  emitNotificationNew,
} = require('../sockets');

class AdjustmentService {
  async getAdjustments(params) {
    return adjustmentRepository.getAll(params);
  }

  async getAdjustmentById(id) {
    const adjustment = await adjustmentRepository.getById(id);
    if (!adjustment) {
      const error = new Error('Stock adjustment not found');
      error.statusCode = 404;
      throw error;
    }
    return adjustment;
  }

  async createAdjustment(data, userId) {
    // If lines don't have recordedQty, populate recordedQty automatically from current stock
    if (data.lines && data.lines.length > 0) {
      for (const line of data.lines) {
        if (line.recordedQty === undefined || line.recordedQty === null) {
          line.recordedQty = await stockLedgerRepository.getCurrentStock(
            line.productId,
            data.warehouseId,
            data.locationId
          );
        }
      }
    }

    const adjustment = await adjustmentRepository.create(data, userId);
    return adjustmentRepository.getById(adjustment.id);
  }

  async validateAdjustment(id, user) {
    const adjustment = await adjustmentRepository.getById(id);
    if (!adjustment) {
      const error = new Error('Stock adjustment not found');
      error.statusCode = 404;
      throw error;
    }

    if (adjustment.status === 'Done') {
      const error = new Error('This adjustment has already been validated');
      error.statusCode = 400;
      throw error;
    }

    if (!adjustment.lines || adjustment.lines.length === 0) {
      const error = new Error('Cannot validate an adjustment without lines');
      error.statusCode = 400;
      throw error;
    }

    const completed = await prisma.$transaction(async (tx) => {
      // 1. Update status
      const updated = await tx.adjustment.update({
        where: { id: Number(id) },
        data: {
          status: 'Done',
          validatedBy: user.id,
          validatedAt: new Date(),
        },
      });

      // 2. Insert ledger entries for delta
      for (const line of adjustment.lines) {
        if (line.deltaQty === 0) continue;

        await tx.stockLedger.create({
          data: {
            productId: line.productId,
            warehouseId: adjustment.warehouseId,
            locationId: adjustment.locationId,
            operationType: 'ADJUSTMENT',
            quantityChange: line.deltaQty,
            referenceId: Number(id),
            referenceType: 'adjustment',
            notes: `Adjustment #${id}: ${adjustment.reason || 'Physical count correction'}`,
            createdBy: user.id,
          },
        });
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'VALIDATE_ADJUSTMENT',
          tableName: 'adjustments',
          recordId: Number(id),
          newValues: JSON.stringify({ status: 'Done', validatedBy: user.name }),
        },
      });

      return updated;
    });

    // Real-time broadcasts
    try {
      for (const line of adjustment.lines) {
        const newTotal = await stockLedgerRepository.getCurrentStock(line.productId);
        emitStockUpdated({ productId: line.productId, newTotal });
      }

      const kpis = await dashboardRepository.getKpis();
      emitKpiUpdated(kpis);

      emitActivityNew({
        user: user.name,
        action: `validated Adjustment #${id}`,
        reference: `Adjustment #${id}`,
        timestamp: new Date().toISOString(),
      });
    } catch (socketErr) {
      console.error('Socket emission error:', socketErr.message);
    }

    return adjustmentRepository.getById(id);
  }
}

module.exports = new AdjustmentService();
