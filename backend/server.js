const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const logger = require('./utils/logger');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', apiLimiter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UniBoard API is running.', database: 'MongoDB' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => logger.info(`UniBoard API listening on http://localhost:${PORT}`));
};

startServer();
