const { Prisma } = require('@prisma/client');

const { prisma } = require('../lib/prisma');

function createHttpError(message, statusCode) {
  return Object.assign(new Error(message), { statusCode });
}

function mapTransaction(transaction) {
  return {
    id: transaction.id,
    transactionCode: transaction.transactionCode,
    cashierName: transaction.user?.fullName ?? null,
    subtotal: Number(transaction.subtotal),
    discount: Number(transaction.discount),
    totalAmount: Number(transaction.totalAmount),
    paymentMethod: transaction.paymentMethod,
    amountReceived:
      transaction.amountReceived === null ? null : Number(transaction.amountReceived),
    amountChange: transaction.amountChange === null ? null : Number(transaction.amountChange),
    createdAt: transaction.createdAt.toISOString(),
    details: transaction.details.map((detail) => ({
      id: detail.id,
      productId: detail.productId,
      productName: detail.product?.name ?? 'Produk',
      quantity: detail.quantity,
      unitPrice: Number(detail.unitPrice),
      totalPrice: Number(detail.totalPrice),
      notes: detail.notes,
    })),
  };
}

async function listTransactions(_req, res) {
  const transactions = await prisma.transaction.findMany({
    include: {
      details: {
        include: {
          product: {
            select: { name: true },
          },
        },
        orderBy: { id: 'asc' },
      },
      user: {
        select: { fullName: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return res.json(transactions.map(mapTransaction));
}

async function createTransaction(req, res) {
  const draft = req.body.draft ?? {};
  const items = Array.isArray(req.body.items) ? req.body.items : [];

  if (!draft.userId || items.length === 0) {
    return res.status(400).json({ message: 'Transaksi harus memiliki user dan item.' });
  }

  const requestedItems = items.reduce((result, item) => {
    const productId = Number(item.productId);
    const quantity = Number(item.quantity);

    if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError('Item transaksi tidak valid.', 400);
    }

    result.set(productId, (result.get(productId) ?? 0) + quantity);
    return result;
  }, new Map());

  const transaction = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: [...requestedItems.keys()] } },
      select: { id: true, name: true, stock: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));

    for (const [productId, requestedQuantity] of requestedItems) {
      const product = productsById.get(productId);

      if (!product) {
        throw createHttpError('Produk transaksi tidak ditemukan.', 404);
      }

      if (product.stock < requestedQuantity) {
        throw createHttpError(`Stok ${product.name} tidak cukup.`, 409);
      }
    }

    const created = await tx.transaction.create({
      data: {
        transactionCode: `TRX-${Date.now()}`,
        userId: Number(draft.userId),
        subtotal: new Prisma.Decimal(Number(draft.subtotal ?? 0)),
        discount: new Prisma.Decimal(Number(draft.discount ?? 0)),
        totalAmount: new Prisma.Decimal(Number(draft.totalAmount ?? 0)),
        paymentMethod: draft.paymentMethod,
        amountReceived:
          draft.amountReceived === undefined || draft.amountReceived === null
            ? null
            : new Prisma.Decimal(Number(draft.amountReceived)),
        amountChange:
          draft.amountReceived === undefined || draft.amountReceived === null
            ? null
            : new Prisma.Decimal(Number(draft.amountReceived) - Number(draft.totalAmount ?? 0)),
      },
      select: { id: true, transactionCode: true },
    });

    await tx.transactionDetail.createMany({
      data: items.map((item) => ({
        transactionId: created.id,
        productId: Number(item.productId),
        quantity: Number(item.quantity),
        unitPrice: new Prisma.Decimal(Number(item.unitPrice)),
        totalPrice: new Prisma.Decimal(Number(item.totalPrice)),
        notes: String(item.notes ?? '').trim() || null,
      })),
    });

    for (const [productId, requestedQuantity] of requestedItems) {
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: requestedQuantity } },
      });

      await tx.stockLog.create({
        data: {
          productId,
          type: 'out',
          quantity: requestedQuantity,
          notes: `Transaksi ${created.transactionCode}`,
        },
      });
    }

    return created;
  });

  return res.status(201).json(transaction);
}

module.exports = { createTransaction, listTransactions };
