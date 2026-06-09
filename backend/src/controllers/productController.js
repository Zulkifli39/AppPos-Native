const { Prisma } = require('@prisma/client');

const { prisma } = require('../lib/prisma');
const { mapProduct } = require('../utils/mappers');

function normalizeProductPayload(body) {
  return {
    categoryId: Number(body.categoryId),
    name: String(body.name ?? '').trim(),
    description: String(body.description ?? '').trim() || null,
    costPrice: new Prisma.Decimal(Number(body.costPrice ?? 0)),
    sellingPrice: new Prisma.Decimal(Number(body.sellingPrice ?? 0)),
    imageUrl: String(body.imageUrl ?? '').trim() || null,
    isBundle: body.isBundle === true || body.isBundle === 'true',
    stock: Number(body.stock ?? 0),
  };
}

async function listProducts(_req, res) {
  const products = await prisma.product.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { name: 'asc' },
  });

  res.json(products.map(mapProduct));
}

async function createProduct(req, res) {
  const payload = normalizeProductPayload(req.body);

  if (!payload.name || !payload.categoryId || payload.stock < 0) {
    return res.status(400).json({ message: 'Data produk tidak valid.' });
  }

  const product = await prisma.product.create({
    data: payload,
    include: { category: { select: { name: true } } },
  });

  return res.status(201).json(mapProduct(product));
}

async function updateProduct(req, res) {
  const payload = normalizeProductPayload(req.body);

  if (!payload.name || !payload.categoryId || payload.stock < 0) {
    return res.status(400).json({ message: 'Data produk tidak valid.' });
  }

  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: payload,
    include: { category: { select: { name: true } } },
  });

  return res.json(mapProduct(product));
}

async function deleteProduct(req, res) {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.status(204).send();
}

module.exports = {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
};
