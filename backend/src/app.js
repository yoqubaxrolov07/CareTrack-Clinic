// Express app setup. Server.js will start it.

const express = require('express');
const cors    = require('cors');

const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Core middleware
app.use(cors());
app.use(express.json());

// Health check (handy for deployment / uptime monitoring)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'CareTrack MRMS API',
    status:  'ok',
    time:    new Date().toISOString(),
  });
});

// Mount the API
app.use('/api', apiRoutes);

// 404 + error handler must be last
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
