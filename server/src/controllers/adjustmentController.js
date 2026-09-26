const adjustmentService = require('../services/adjustmentService');

class AdjustmentController {
  async getAll(req, res, next) {
    try {
      const result = await adjustmentService.getAdjustments(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const adjustment = await adjustmentService.getAdjustmentById(req.params.id);
      res.json({ success: true, adjustment });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const adjustment = await adjustmentService.createAdjustment(req.body, req.user.id);
      res.status(201).json({ success: true, adjustment });
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      const adjustment = await adjustmentService.validateAdjustment(req.params.id, req.user);
      res.json({ success: true, message: 'Stock adjustment validated. Stock reconciled in ledger.', adjustment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdjustmentController();
