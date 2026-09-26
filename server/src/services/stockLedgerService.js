const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const { stringifyToCsv } = require('../utils/csv');

class StockLedgerService {
  async getLedger(params) {
    return stockLedgerRepository.getLedgerEntries(params);
  }

  async exportLedgerCsv(params) {
    const { entries } = await stockLedgerRepository.getLedgerEntries({
      ...params,
      limit: 100000,
    });

    const records = entries.map((e) => ({
      EntryID: e.id,
      Date: e.createdAt.toISOString(),
      ProductName: e.product?.name || '',
      SKU: e.product?.sku || '',
      Warehouse: e.warehouse?.name || 'Unassigned',
      Location: e.location ? `${e.location.name} (${e.location.aisle}-${e.location.rack}-${e.location.shelf})` : 'N/A',
      Operation: e.operationType,
      QuantityChange: e.quantityChange,
      Reference: e.referenceType ? `${e.referenceType} #${e.referenceId}` : 'Direct',
      Notes: e.notes || '',
      User: e.creator?.name || 'System',
    }));

    return stringifyToCsv(records);
  }
}

module.exports = new StockLedgerService();
