const path = require('path');

const port = Number(process.env.API_PORT ?? process.env.PORT ?? 4000);
const host = process.env.API_HOST ?? '0.0.0.0';
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '8h';
const uploadRoot = path.join(__dirname, '..', '..', 'uploads');

if (!jwtSecret) {
  throw new Error('JWT_SECRET wajib diisi di file .env backend.');
}

module.exports = {
  corsOrigin: process.env.CORS_ORIGIN || true,
  host,
  jwtExpiresIn,
  jwtSecret,
  port,
  uploadRoot,
};
