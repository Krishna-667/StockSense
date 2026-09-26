const productService = require('../services/productService');

class ProductController {
  async getAll(req, res, next) {
    try {
      const result = await productService.getProducts(req.query);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body, req.user.id);
      res.status(201).json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body, req.user.id);
      res.json({ success: true, product });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await productService.deleteProduct(req.params.id, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getLedger(req, res, next) {
    try {
      const ledger = await productService.getProductLedger(req.params.id);
      res.json({ success: true, ledger });
    } catch (error) {
      next(error);
    }
  }

  async importCsv(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please provide a CSV file' });
      }
      const result = await productService.bulkImportCsv(req.file.buffer, req.user.id);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req, res, next) {
    try {
      const csv = await productService.exportProductsCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="stocksense-products.csv"');
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProductController();
