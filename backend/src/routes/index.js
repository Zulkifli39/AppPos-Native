const express = require('express');

const { authRoutes } = require('./authRoutes');
const { categoryRoutes } = require('./categoryRoutes');
const { productRoutes } = require('./productRoutes');
const { transactionRoutes } = require('./transactionRoutes');
const { uploadRoutes } = require('./uploadRoutes');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

router.use('/auth', authRoutes);
router.use(requireAuth);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/uploads', uploadRoutes);
router.use('/transactions', transactionRoutes);

module.exports = { apiRoutes: router };
