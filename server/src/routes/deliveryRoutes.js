const express = require('express');
const { z } = require('zod');
const deliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const deliveryLineSchema = z.object({
  productId: z.number({ required_error: 'Product is required' }),
  locationId: z.number().nullable().optional(),
  requestedQty: z.number().min(0.01, 'Quantity must be greater than 0'),
  deliveredQty: z.number().min(0, 'Delivered quantity cannot be negative').optional(),
});

const createDeliverySchema = z.object({
  customerId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['Draft', 'Waiting', 'Ready']).optional(),
  lines: z.array(deliveryLineSchema).min(1, 'At least one product line is required'),
});

const updateDeliverySchema = z.object({
  customerId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['Draft', 'Waiting', 'Ready']).optional(),
  lines: z.array(deliveryLineSchema).optional(),
});

router.use(authenticate);

router.get('/', deliveryController.getAll);
router.get('/:id', deliveryController.getById);
router.post('/', validate(createDeliverySchema), deliveryController.create);
router.put('/:id', validate(updateDeliverySchema), deliveryController.update);
router.post('/:id/validate', requireRole('MANAGER'), deliveryController.validate);
router.post('/:id/cancel', deliveryController.cancel);

module.exports = router;
