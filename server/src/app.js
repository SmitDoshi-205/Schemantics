const express = require('express');
const cors = require('cors');
const authRoute = require('./routes/auth');
const endpointsRoute = require('./routes/endpoints');

const healthRoute = require('./routes/health');
const { notFound, errorHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  // --- Core middleware ---
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // --- Routes ---
  app.use('/api/health', healthRoute);
  app.use('/api/auth', authRoute);
  app.use('/api/endpoints', endpointsRoute);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;