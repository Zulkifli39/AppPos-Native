const fs = require('fs');
const multer = require('multer');
const path = require('path');

const { uploadRoot } = require('../config/env');

const productUploadDir = path.join(uploadRoot, 'products');

fs.mkdirSync(productUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: productUploadDir,
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || '.jpg';
    const safeBase = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    cb(null, `${Date.now()}-${safeBase || 'product'}${extension.toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = { upload };
