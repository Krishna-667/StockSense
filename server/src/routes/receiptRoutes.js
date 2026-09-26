const express = require('express');
const { z } = require('zod');
const receiptController = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();

const receiptLineSchema = z.object({
  productId: z.number({ required_error: 'Product is required' }),
  locationId: z.number().nullable().optional(),
  expectedQty: z.number().min(0.01, 'Quantity must be greater than 0'),
  receivedQty: z.number().min(0, 'Received quantity cannot be negative').optional(),
});

const createReceiptSchema = z.object({
  supplierId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['Draft', 'Waiting', 'Ready']).optional(),
  lines: z.array(receiptLineSchema).min(1, 'At least one product line is required'),
});

const updateReceiptSchema = z.object({
  supplierId: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: z.enum(['Draft', 'Waiting', 'Ready']).optional(),
  lines: z.array(receiptLineSchema).optional(),
});

router.use(authenticate);

router.get('/', receiptController.getAll);
router.get('/:id', receiptController.getById);
router.post('/', validate(createReceiptSchema), receiptController.create);
router.put('/:id', validate(updateReceiptSchema), receiptController.update);
router.post('/:id/validate', requireRole('MANAGER'), receiptController.validate);
router.post('/:id/cancel', receiptController.cancel);

module.exports = router;
