const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { jwtExpiresIn, jwtSecret } = require('../config/env');
const { prisma } = require('../lib/prisma');
const { mapUser } = require('../utils/mappers');

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

async function login(req, res) {
  const username = String(req.body.username ?? '').trim();
  const password = String(req.body.password ?? '').trim();

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, password: true, fullName: true, role: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Username atau password tidak sesuai.' });
  }

  const safeUser = mapUser(user);

  return res.json({
    user: safeUser,
    token: signAccessToken(safeUser),
  });
}

function me(req, res) {
  res.json(mapUser(req.user));
}

module.exports = {
  login,
  me,
};
