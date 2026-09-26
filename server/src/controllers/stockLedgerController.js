const stockLedgerService = require('../services/stockLedgerService');

class StockLedgerController {
  async getAll(req, res, next) {
    try {
      const result = await stockLedgerService.getLedger(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const csv = await stockLedgerService.exportLedgerCsv(req.query);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="stocksense-ledger.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockLedgerController();
