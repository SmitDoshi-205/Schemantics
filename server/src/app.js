const express = require('express');
const cors = require('cors');

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

  // Endpoint CRUD, auth, etc. get mounted here starting Day 2/3.

  // --- 404 + error handling (must stay last) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
