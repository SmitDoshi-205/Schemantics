const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/**
 * GET /api/health
 * Basic liveness check - confirms the server process is up and reports
 * current DB connection state. No auth, no DB write - safe to hit from
 * uptime monitors, load balancers, or just your browser.
 */
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    status: 'ok',
    service: 'schemantics-server',
    timestamp: new Date().toISOString(),
    uptimeSeconds: process.uptime(),
    db: dbStates[mongoose.connection.readyState] || 'unknown',
  });
});

module.exports = router;
