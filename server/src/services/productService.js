const productRepository = require('../repositories/productRepository');
const stockLedgerRepository = require('../repositories/stockLedgerRepository');
const { parseCsvBuffer, stringifyToCsv } = require('../utils/csv');
const prisma = require('../lib/prisma');

class ProductService {
  async getProducts(params) {
    return productRepository.getAll(params);
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }
    return product;
  }

  async createProduct(data, userId) {
    const existing = await productRepository.getBySku(data.sku);
    if (existing) {
      const error = new Error(`A product with SKU "${data.sku}" already exists`);
      error.statusCode = 400;
      throw error;
    }

    const created = await productRepository.create(data);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'CREATE_PRODUCT',
        tableName: 'products',
        recordId: created.id,
        newValues: JSON.stringify(created),
      },
    });

    return productRepository.getById(created.id);
  }

  async updateProduct(id, data, userId) {
    const product = await productRepository.getById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.sku && data.sku !== product.sku) {
      const existing = await productRepository.getBySku(data.sku);
      if (existing && existing.id !== Number(id)) {
        const error = new Error(`A product with SKU "${data.sku}" already exists`);
        error.statusCode = 400;
        throw error;
      }
    }

    const updated = await productRepository.update(id, data);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'UPDATE_PRODUCT',
        tableName: 'products',
        recordId: Number(id),
        oldValues: JSON.stringify({ name: product.name, sku: product.sku }),
        newValues: JSON.stringify(updated),
      },
    });

    return productRepository.getById(id);
  }

  async deleteProduct(id, userId) {
    const product = await productRepository.getById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    await productRepository.softDelete(id);

    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'DELETE_PRODUCT',
        tableName: 'products',
        recordId: Number(id),
      },
    });

    return { success: true, message: 'Product deleted successfully' };
  }

  async getProductLedger(id) {
    const product = await productRepository.getById(id);
    if (!product) {
      const error = new Error('Product not found');
      error.statusCode = 404;
      throw error;
    }

    return stockLedgerRepository.getLedgerForProduct(id);
  }

  async bulkImportCsv(buffer, userId) {
    const records = await parseCsvBuffer(buffer);
    if (!records || records.length === 0) {
      const error = new Error('CSV file is empty or could not be parsed');
      error.statusCode = 400;
      throw error;
    }

    const categories = await prisma.productCategory.findMany();
    const uoms = await prisma.unitOfMeasure.findMany();

    const catMap = {};
    categories.forEach((c) => (catMap[c.name.toLowerCase()] = c.id));

    const uomMap = {};
    uoms.forEach((u) => {
      uomMap[u.abbreviation.toLowerCase()] = u.id;
      uomMap[u.name.toLowerCase()] = u.id;
    });

    let importedCount = 0;
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNum = i + 2;

      const name = row.name || row.Name;
      const sku = row.sku || row.SKU;
      const categoryName = (row.category || row.Category || '').toLowerCase();
      const uomName = (row.uom || row.UOM || 'pcs').toLowerCase();
      const reorderLevel = parseFloat(row.reorder_level || row.reorderLevel || row.ReorderLevel || 10);
      const description = row.description || row.Description || '';

      if (!name || !sku) {
        errors.push(`Row ${rowNum}: Name and SKU are required`);
        continue;
      }

      const existing = await prisma.product.findUnique({
        where: { sku },
      });

      if (existing) {
        errors.push(`Row ${rowNum}: SKU "${sku}" already exists, skipped`);
        continue;
      }

      let categoryId = catMap[categoryName] || null;
      let uomId = uomMap[uomName] || uoms[0]?.id || null;

      await prisma.product.create({
        data: {
          name,
          sku,
          categoryId,
          uomId,
          reorderLevel: isNaN(reorderLevel) ? 10 : reorderLevel,
          description,
        },
      });

      importedCount++;
    }

    await prisma.auditLog.create({
      data: {
        userId: Number(userId),
        action: 'CSV_IMPORT_PRODUCTS',
        tableName: 'products',
        newValues: JSON.stringify({ importedCount, errorCount: errors.length }),
      },
    });

    return { importedCount, errors };
  }

  async exportProductsCsv() {
    const { products } = await productRepository.getAll({ limit: 10000 });

    const records = products.map((p) => ({
      ID: p.id,
      Name: p.name,
      SKU: p.sku,
      Category: p.category?.name || '',
      UOM: p.uom?.abbreviation || '',
      CurrentStock: p.currentStock,
      ReorderLevel: p.reorderLevel,
      Status: p.stockStatus,
      Description: p.description || '',
    }));

    return stringifyToCsv(records);
  }
}

module.exports = new ProductService();
