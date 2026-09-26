const transferService = require('../services/transferService');

class TransferController {
  async getAll(req, res, next) {
    try {
      const result = await transferService.getTransfers(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const transfer = await transferService.getTransferById(req.params.id);
      res.json({ success: true, transfer });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const transfer = await transferService.createTransfer(req.body, req.user.id);
      res.status(201).json({ success: true, transfer });
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      const transfer = await transferService.validateTransfer(req.params.id, req.user);
      res.json({ success: true, message: 'Transfer validated. Double-entry ledger records created.', transfer });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TransferController();
