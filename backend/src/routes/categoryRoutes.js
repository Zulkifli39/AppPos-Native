const express = require('express');

const {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} = require('../controllers/categoryController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(listCategories));
router.post('/', asyncHandler(createCategory));
router.put('/:id', asyncHandler(updateCategory));
router.delete('/:id', asyncHandler(deleteCategory));

module.exports = { categoryRoutes: router };
