const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const receiptRoutes = require('./receiptRoutes');
const deliveryRoutes = require('./deliveryRoutes');
const transferRoutes = require('./transferRoutes');
const adjustmentRoutes = require('./adjustmentRoutes');
const stockLedgerRoutes = require('./stockLedgerRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const notificationRoutes = require('./notificationRoutes');
const warehouseRoutes = require('./warehouseRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/adjustments', adjustmentRoutes);
router.use('/ledger', stockLedgerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', warehouseRoutes);

module.exports = router;
