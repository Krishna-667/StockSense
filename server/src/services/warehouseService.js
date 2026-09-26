const warehouseRepository = require('../repositories/warehouseRepository');

class WarehouseService {
  async getWarehouses() {
    return warehouseRepository.getWarehouses();
  }

  async createWarehouse(data) {
    return warehouseRepository.createWarehouse(data);
  }

  async updateWarehouse(id, data) {
    return warehouseRepository.updateWarehouse(id, data);
  }

  async getLocations(warehouseId) {
    return warehouseRepository.getLocations(warehouseId);
  }

  async createLocation(data) {
    return warehouseRepository.createLocation(data);
  }

  async getCategories() {
    return warehouseRepository.getCategories();
  }

  async createCategory(data) {
    return warehouseRepository.createCategory(data);
  }

  async getUOMs() {
    return warehouseRepository.getUOMs();
  }

  async createUOM(data) {
    return warehouseRepository.createUOM(data);
  }

  async getSuppliers() {
    return warehouseRepository.getSuppliers();
  }

  async createSupplier(data) {
    return warehouseRepository.createSupplier(data);
  }

  async getCustomers() {
    return warehouseRepository.getCustomers();
  }

  async createCustomer(data) {
    return warehouseRepository.createCustomer(data);
  }
}

module.exports = new WarehouseService();
