const deliveryService = require('../services/deliveryService');

class DeliveryController {
  async getAll(req, res, next) {
    try {
      const result = await deliveryService.getDeliveries(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const delivery = await deliveryService.getDeliveryById(req.params.id);
      res.json({ success: true, delivery });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const delivery = await deliveryService.createDelivery(req.body, req.user.id);
      res.status(201).json({ success: true, delivery });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const delivery = await deliveryService.updateDelivery(req.params.id, req.body, req.user.id);
      res.json({ success: true, delivery });
    } catch (error) {
      next(error);
    }
  }

  async validate(req, res, next) {
    try {
      const delivery = await deliveryService.validateDelivery(req.params.id, req.user);
      res.json({ success: true, message: 'Delivery order validated. Outbound stock deducted.', delivery });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const delivery = await deliveryService.cancelDelivery(req.params.id, req.user.id);
      res.json({ success: true, message: 'Delivery order cancelled', delivery });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DeliveryController();
