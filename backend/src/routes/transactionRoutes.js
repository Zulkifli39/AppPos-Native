const express = require('express');

const { createTransaction, listTransactions } = require('../controllers/transactionController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listTransactions));
router.post('/', asyncHandler(createTransaction));

module.exports = { transactionRoutes: router };
