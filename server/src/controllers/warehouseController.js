const warehouseService = require('../services/warehouseService');

class WarehouseController {
  async getWarehouses(req, res, next) {
    try {
      const warehouses = await warehouseService.getWarehouses();
      res.json({ success: true, warehouses });
    } catch (error) {
      next(error);
    }
  }

  async createWarehouse(req, res, next) {
    try {
      const warehouse = await warehouseService.createWarehouse(req.body);
      res.status(201).json({ success: true, warehouse });
    } catch (error) {
      next(error);
    }
  }

  async updateWarehouse(req, res, next) {
    try {
      const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
      res.json({ success: true, warehouse });
    } catch (error) {
      next(error);
    }
  }

  async getLocations(req, res, next) {
    try {
      const locations = await warehouseService.getLocations(req.query.warehouseId);
      res.json({ success: true, locations });
    } catch (error) {
      next(error);
    }
  }

  async createLocation(req, res, next) {
    try {
      const location = await warehouseService.createLocation(req.body);
      res.status(201).json({ success: true, location });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const categories = await warehouseService.getCategories();
      res.json({ success: true, categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const category = await warehouseService.createCategory(req.body);
      res.status(201).json({ success: true, category });
    } catch (error) {
      next(error);
    }
  }

  async getUOMs(req, res, next) {
    try {
      const uoms = await warehouseService.getUOMs();
      res.json({ success: true, uoms });
    } catch (error) {
      next(error);
    }
  }

  async createUOM(req, res, next) {
    try {
      const uom = await warehouseService.createUOM(req.body);
      res.status(201).json({ success: true, uom });
    } catch (error) {
      next(error);
    }
  }

  async getSuppliers(req, res, next) {
    try {
      const suppliers = await warehouseService.getSuppliers();
      res.json({ success: true, suppliers });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req, res, next) {
    try {
      const supplier = await warehouseService.createSupplier(req.body);
      res.status(201).json({ success: true, supplier });
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req, res, next) {
    try {
      const customers = await warehouseService.getCustomers();
      res.json({ success: true, customers });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      const customer = await warehouseService.createCustomer(req.body);
      res.status(201).json({ success: true, customer });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WarehouseController();
