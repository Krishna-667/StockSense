const express = require('express');
const { z } = require('zod');
const transferController = require('../controllers/transferController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const transferLineSchema = z.object({
  productId: z.number({ required_error: 'Product is required' }),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
});

const createTransferSchema = z.object({
  fromWarehouseId: z.number().nullable().optional(),
  toWarehouseId: z.number().nullable().optional(),
  fromLocationId: z.number().nullable().optional(),
  toLocationId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  lines: z.array(transferLineSchema).min(1, 'At least one product line is required'),
});

router.use(authenticate);

router.get('/', transferController.getAll);
router.get('/:id', transferController.getById);
router.post('/', validate(createTransferSchema), transferController.create);
router.post('/:id/validate', transferController.validate);

module.exports = router;
