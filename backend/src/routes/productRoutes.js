const express = require('express');

const {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} = require('../controllers/productController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listProducts));
router.post('/', asyncHandler(createProduct));
router.put('/:id', asyncHandler(updateProduct));
router.delete('/:id', asyncHandler(deleteProduct));

module.exports = { productRoutes: router };
