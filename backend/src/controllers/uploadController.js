function publicUrl(req, uploadPath) {
  return `${req.protocol}://${req.get('host')}${uploadPath}`;
}

function uploadProductImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'File gambar wajib dikirim.' });
  }

  const uploadPath = `/uploads/products/${req.file.filename}`;
  return res.status(201).json({ imageUrl: publicUrl(req, uploadPath) });
}

module.exports = { uploadProductImage };
