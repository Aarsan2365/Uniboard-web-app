const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');
const attachmentStore = require('./utils/attachmentStore');
const { serverless, uploadDirectory } = require('./utils/storagePaths');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api', apiLimiter);
app.use('/documents', notFound);
app.get('/uploads/:filename', attachmentStore.serveImage);
app.use('/uploads', express.static(uploadDirectory));

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
  const connected = require('mongoose').connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ status: connected ? 'UniBoard API is running.' : 'Database is unavailable.', database: connected ? 'connected' : 'disconnected' });
});

const frontendDist = path.join(__dirname, '../frontend/dist');
if (!serverless && require('fs').existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
    throw new Error('Set a unique JWT_SECRET in backend/.env before starting.');
  }
  if (!['local', 'mongodb'].includes(process.env.UPLOAD_STORAGE || 'local')) throw new Error('UPLOAD_STORAGE must be local or mongodb.');
  await connectDB();
  const server = app.listen(PORT, () => logger.info(`UniBoard API listening on http://localhost:${PORT}`));
  server.on('error', err => {
    logger.error(err.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Stop the old backend before starting a new one.` : 'Server listen failed', err);
    process.exitCode = 1;
  });
  return server;
};

if (require.main === module) {
  startServer().catch(err => {
    logger.error('Server startup failed', err);
    process.exitCode = 1;
  });
}
module.exports = { app, startServer };
