const express = require('express');
const { z } = require('zod');
const warehouseController = require('../controllers/warehouseController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const warehouseSchema = z.object({
  name: z.string().min(2, 'Warehouse name is required'),
  address: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const locationSchema = z.object({
  warehouseId: z.number({ required_error: 'Warehouse ID is required' }),
  name: z.string().min(2, 'Location name is required'),
  aisle: z.string().nullable().optional(),
  rack: z.string().nullable().optional(),
  shelf: z.string().nullable().optional(),
});

const categorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  parentId: z.number().nullable().optional(),
});

const uomSchema = z.object({
  name: z.string().min(2, 'UOM name is required'),
  abbreviation: z.string().min(1, 'Abbreviation is required'),
});

const partySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email().nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
});

router.use(authenticate);

// Warehouses
router.get('/warehouses', warehouseController.getWarehouses);
router.post('/warehouses', requireRole('MANAGER'), validate(warehouseSchema), warehouseController.createWarehouse);
router.put('/warehouses/:id', requireRole('MANAGER'), warehouseController.updateWarehouse);

// Locations
router.get('/locations', warehouseController.getLocations);
router.post('/locations', requireRole('MANAGER'), validate(locationSchema), warehouseController.createLocation);

// Categories
router.get('/categories', warehouseController.getCategories);
router.post('/categories', requireRole('MANAGER'), validate(categorySchema), warehouseController.createCategory);

// Units of Measure
router.get('/uoms', warehouseController.getUOMs);
router.post('/uoms', requireRole('MANAGER'), validate(uomSchema), warehouseController.createUOM);

// Suppliers & Customers
router.get('/suppliers', warehouseController.getSuppliers);
router.post('/suppliers', validate(partySchema), warehouseController.createSupplier);

router.get('/customers', warehouseController.getCustomers);
router.post('/customers', validate(partySchema), warehouseController.createCustomer);

module.exports = router;
