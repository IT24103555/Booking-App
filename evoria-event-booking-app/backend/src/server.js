const path = require('path');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketTypeRoutes = require('./routes/ticketTypeRoutes');
const venueRoutes = require('./routes/venueRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const sessionAgendaRoutes = require('./routes/sessionAgendaRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env (Render/Railway will inject env vars in production)
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security + logs (beginner-friendly defaults)
// Allow images/assets to be loaded by the web app running on a different local origin (port 8083).
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(morgan('dev'));

// Enable CORS so the React Native app can call the API
// Supports:
// - CORS_ORIGIN="*" (allow any origin)
// - CORS_ORIGIN="http://localhost:19006,https://your-app.com" (allow list)
const corsOriginRaw = (process.env.CORS_ORIGIN || '*').trim();
const corsAllowList = corsOriginRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== 'production';
const isDevFriendlyOrigin = (origin) => {
  if (!origin) return false;
  // Allow common local web dev origins (Expo web / CRA / Vite / etc.)
  return (
    /^http:\/\/localhost(?::\d+)?$/i.test(origin) ||
    /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin)
  );
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman, curl) with no Origin header
    if (!origin) return callback(null, true);
    if (corsAllowList.includes('*')) return callback(null, true);
    if (corsAllowList.includes(origin)) return callback(null, true);
    if (isDev && isDevFriendlyOrigin(origin)) return callback(null, true);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
  // We use Authorization header (JWT), not cookies — credentials are optional.
  // Keep enabled for flexibility, but only safe when origin is not '*'.
  credentials: !corsAllowList.includes('*'),
};

app.use(cors(corsOptions));
// Explicit preflight handler so browsers don't hit route handlers/error middleware
app.options('*', cors(corsOptions));

// Parse JSON request bodies
app.use(express.json());

// Serve uploaded files (for demo). NOTE: Render disk is ephemeral; prefer image URLs in production.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Evoria API is running' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ticket-types', ticketTypeRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/session-agendas', sessionAgendaRoutes);

// 404 + central error handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Evoria API listening on port ${PORT}`);
});
