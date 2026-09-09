import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { globalApiLimiter } from './middleware/rateLimiter.js';
import apiRoutes from './routes/index.js';
import { testDbConnection } from './config/db.js';

const app = express();

// Security Headers
app.use(helmet());

// Production-safe environment-driven CORS configuration
const getAllowedOrigins = () => {
  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    return Array.from(new Set([...localOrigins, ...envOrigins]));
  }
  return localOrigins;
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, mobile apps, same-origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && origin.startsWith('http://localhost:'))) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Global API Rate Limiter
app.use('/api', globalApiLimiter);

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'ARCO Communication API Server',
    status: 'Running',
    database: 'PostgreSQL 18 (arco_communication)',
    documentation: '/api/health',
  });
});

// Centralized error handler
app.use(errorHandler);

// Start listening
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (config.port || 5000);
const HOST = process.env.HOST || config.host || '0.0.0.0';

const server = app.listen(PORT, HOST, async () => {
  const address = server.address();
  const boundHost = typeof address === 'object' && address ? address.address : HOST;
  const boundPort = typeof address === 'object' && address ? address.port : PORT;

  console.log(`=========================================`);
  console.log(`🚀 ARCO Communication Backend Server running`);
  console.log(`📍 Host: ${boundHost}`);
  console.log(`📍 Port: ${boundPort}`);
  console.log(`🐘 Database: PostgreSQL 18 (arco_communication)`);
  console.log(`🌐 Base URL: http://${boundHost}:${boundPort}/api`);
  console.log(`🩺 Health Check: http://${boundHost}:${boundPort}/api/health`);
  console.log(`=========================================`);

  // Test PostgreSQL connection
  await testDbConnection();
});

server.on('error', (err) => {
  console.error('[Server Listen Error]:', err.message);
  process.exit(1);
});

export default app;
