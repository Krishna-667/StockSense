const express = require('express');
const { z } = require('zod');
const adjustmentController = require('../controllers/adjustmentController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const adjustmentLineSchema = z.object({
  productId: z.number({ required_error: 'Product is required' }),
  recordedQty: z.number().optional(),
  physicalQty: z.number().min(0, 'Physical count cannot be negative'),
});

const createAdjustmentSchema = z.object({
  warehouseId: z.number({ required_error: 'Warehouse is required' }),
  locationId: z.number().nullable().optional(),
  reason: z.string().min(2, 'Reason for adjustment is required'),
  notes: z.string().nullable().optional(),
  lines: z.array(adjustmentLineSchema).min(1, 'At least one line item is required'),
});

router.use(authenticate);

router.get('/', adjustmentController.getAll);
router.get('/:id', adjustmentController.getById);
router.post('/', validate(createAdjustmentSchema), adjustmentController.create);
router.post('/:id/validate', requireRole('MANAGER'), adjustmentController.validate);

module.exports = router;
