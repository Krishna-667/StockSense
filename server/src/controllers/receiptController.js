const receiptService = require('../services/receiptService');

class ReceiptController {
  async getAll(req, res, next) {
    try {
      const result = await receiptService.getReceipts(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const receipt = await receiptService.getReceiptById(req.params.id);
      res.json({ success: true, receipt });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const receipt = await receiptService.createReceipt(req.body, req.user.id);
      res.status(201).json({ success: true, receipt });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const receipt = await receiptService.updateReceipt(req.params.id, req.body, req.user.id);
      res.json({ success: true, receipt });
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      const receipt = await receiptService.validateReceipt(req.params.id, req.user);
      res.json({ success: true, message: 'Receipt validated successfully. Stock ledger updated.', receipt });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const receipt = await receiptService.cancelReceipt(req.params.id, req.user.id);
      res.json({ success: true, message: 'Receipt cancelled', receipt });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReceiptController();
