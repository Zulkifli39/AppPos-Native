const jwt = require('jsonwebtoken');

const { jwtSecret } = require('../config/env');
const { prisma } = require('../lib/prisma');

async function requireAuth(req, res, next) {
  const authHeader = req.get('authorization') ?? '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token login wajib dikirim.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, username: true, fullName: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Token login tidak valid.' });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Token login tidak valid atau sudah kedaluwarsa.' });
  }
}

module.exports = { requireAuth };
