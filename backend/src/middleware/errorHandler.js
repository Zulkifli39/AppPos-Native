const { Prisma } = require('@prisma/client');

function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.statusCode) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
    return res.status(404).json({ message: 'Data tidak ditemukan.' });
  }

  return res.status(500).json({ message: error.message || 'Terjadi kesalahan server.' });
}

module.exports = { errorHandler };
