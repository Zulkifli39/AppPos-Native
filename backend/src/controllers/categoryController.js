const { prisma } = require('../lib/prisma');
const { mapCategory } = require('../utils/mappers');

function normalizeCategoryPayload(body) {
  return {
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim() || null,
  };
}

async function listCategories(_req, res) {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories.map(mapCategory));
}

async function createCategory(req, res) {
  const payload = normalizeCategoryPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
  }

  const category = await prisma.category.create({ data: payload });
  return res.status(201).json(mapCategory(category));
}

async function updateCategory(req, res) {
  const payload = normalizeCategoryPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ message: 'Nama kategori wajib diisi.' });
  }

  const category = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: payload,
  });

  return res.json(mapCategory(category));
}

async function deleteCategory(req, res) {
  const id = Number(req.params.id);
  const productsCount = await prisma.product.count({ where: { categoryId: id } });

  if (productsCount > 0) {
    return res
      .status(409)
      .json({ message: 'Kategori tidak bisa dihapus karena masih digunakan oleh produk.' });
  }

  await prisma.category.delete({ where: { id } });
  return res.status(204).send();
}

module.exports = {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
};
