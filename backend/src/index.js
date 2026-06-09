require('dotenv').config();

const cors = require('cors');
const express = require('express');

const { corsOrigin, host, port, uploadRoot } = require('./config/env');
const { errorHandler } = require('./middleware/errorHandler');
const { apiRoutes } = require('./routes');

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadRoot));
app.use('/api', apiRoutes);
app.use(errorHandler);

app.listen(port, host, () => {
  console.log(`Native POS API running on http://${host}:${port}`);
});
