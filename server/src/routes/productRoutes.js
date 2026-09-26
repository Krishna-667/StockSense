const express = require('express');
const multer = require('multer');
const { z } = require('zod');
const productController = require('../controllers/productController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  categoryId: z.number().nullable().optional(),
  uomId: z.number().nullable().optional(),
  reorderLevel: z.number().min(0, 'Reorder level must be 0 or greater').optional(),
  description: z.string().nullable().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(2, 'Product name is required').optional(),
  sku: z.string().min(2, 'SKU is required').optional(),
  categoryId: z.number().nullable().optional(),
  uomId: z.number().nullable().optional(),
  reorderLevel: z.number().min(0, 'Reorder level must be 0 or greater').optional(),
  description: z.string().nullable().optional(),
});

// All product routes require authentication
router.use(authenticate);

router.get('/', productController.getAll);
router.get('/export', productController.exportCsv);
router.get('/:id', productController.getById);
router.get('/:id/ledger', productController.getLedger);

router.post('/', validate(createProductSchema), productController.create);
router.put('/:id', validate(updateProductSchema), productController.update);
router.delete('/:id', requireRole('MANAGER'), productController.delete);
router.post('/import', upload.single('file'), productController.importCsv);

module.exports = router;
