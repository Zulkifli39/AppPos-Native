const express = require('express');

const { uploadProductImage } = require('../controllers/uploadController');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.post('/products', upload.single('image'), uploadProductImage);

module.exports = { uploadRoutes: router };
