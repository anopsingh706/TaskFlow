const express   = require('express');
const http      = require('http');
const cors      = require('cors');
const morgan    = require('morgan');
const dotenv    = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB          = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const passport           = require('./config/passport');
const { initSocket }     = require('./config/socket');

// Routes
const authRoutes    = require('./routes/authRoutes');
const channelRoutes = require('./routes/channelRoutes');
const messageRoutes = require('./routes/messageRoutes');
const taskRoutes    = require('./routes/taskRoutes');    // Phase 3
const aiRoutes      = require('./routes/aiRoutes');      // Phase 3
const meetingRoutes = require('./routes/meetingRoutes'); // Phase 4
const notifRoutes   = require('./routes/notificationRoutes'); // Phase 4
const paymentRoutes = require('./routes/paymentRoutes'); // Phase 5

connectDB();

const app    = express();
const server = http.createServer(app);

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// ⚠️ Razorpay webhook is handled within paymentRoutes
// app.post('/api/payments/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhook);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(passport.initialize());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api', rateLimit({
  windowMs: 60 * 1000, max: 300,
  message: { success: false, message: 'Too many requests.' },
  standardHeaders: true, legacyHeaders: false,
}));

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: '🚀 TaskFlow API running', env: process.env.NODE_ENV })
);

app.use('/api/auth',          authRoutes);
app.use('/api/channels',      channelRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/payments',      paymentRoutes);

app.use(notFound);
app.use(errorHandler);

const io = initSocket(server);
app.set('io', io);

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🚀 TaskFlow Server  →  http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready · 🤖 Gemini AI ready`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV}\n`);
});

module.exports = { app, server };