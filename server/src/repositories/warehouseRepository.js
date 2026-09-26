const prisma = require('../lib/prisma');

class WarehouseRepository {
  async getWarehouses() {
    return prisma.warehouse.findMany({
      where: { deletedAt: null },
      include: {
        locations: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async getLocations(warehouseId = null) {
    const where = {};
    if (warehouseId) where.warehouseId = Number(warehouseId);
    return prisma.location.findMany({
      where,
      include: { warehouse: true },
      orderBy: [{ warehouseId: 'asc' }, { name: 'asc' }],
    });
  }

  async createWarehouse(data) {
    return prisma.warehouse.create({
      data: {
        name: data.name,
        address: data.address || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  async updateWarehouse(id, data) {
    return prisma.warehouse.update({
      where: { id: Number(id) },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        address: data.address !== undefined ? data.address : undefined,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : undefined,
      },
    });
  }

  async createLocation(data) {
    return prisma.location.create({
      data: {
        warehouseId: Number(data.warehouseId),
        name: data.name,
        aisle: data.aisle || null,
        rack: data.rack || null,
        shelf: data.shelf || null,
      },
      include: { warehouse: true },
    });
  }

  async getCategories() {
    return prisma.productCategory.findMany({
      include: {
        children: true,
        parent: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data) {
    return prisma.productCategory.create({
      data: {
        name: data.name,
        parentId: data.parentId ? Number(data.parentId) : null,
      },
    });
  }

  async getUOMs() {
    return prisma.unitOfMeasure.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createUOM(data) {
    return prisma.unitOfMeasure.create({
      data: {
        name: data.name,
        abbreviation: data.abbreviation,
      },
    });
  }

  async getSuppliers() {
    return prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createSupplier(data) {
    return prisma.supplier.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });
  }

  async getCustomers() {
    return prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCustomer(data) {
    return prisma.customer.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });
  }
}

module.exports = new WarehouseRepository();
