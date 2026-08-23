require('dotenv').config();

const createApp = require('./app');
const connectDB = require('./config/db');
const { startScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`[server] Schemantics backend listening on port ${PORT}`);
    console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
  });
  startScheduler();
}

start();