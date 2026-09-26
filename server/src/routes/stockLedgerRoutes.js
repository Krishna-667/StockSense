const express = require('express');
const stockLedgerController = require('../controllers/stockLedgerController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', stockLedgerController.getAll);
router.get('/export', stockLedgerController.exportCsv);

module.exports = router;
