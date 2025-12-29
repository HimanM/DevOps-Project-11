/**
 * DevSecOps Backend API Server
 * 
 * A minimal, security-focused Express server demonstrating
 * secure defaults and environment-based configuration.
 */

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

// Environment-based configuration
const config = {
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  serviceName: process.env.SERVICE_NAME || 'devsecops-backend',
  version: process.env.APP_VERSION || '1.0.0'
};

const app = express();

// Security middleware - Helmet sets various HTTP headers for security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration - restrict to allowed origins only
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, health checks)
    if (!origin) return callback(null, true);
    
    if (config.allowedOrigins.includes(origin) || config.allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));

// Compression for response optimization
app.use(compression());

// Parse JSON bodies with size limit
app.use(express.json({ limit: '10kb' }));

// Disable X-Powered-By header
app.disable('x-powered-by');

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

/**
 * Health Check Endpoint
 * Used by load balancers and container orchestration for health verification
 */
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: config.serviceName,
    version: config.version,
    uptime: process.uptime(),
    environment: config.nodeEnv,
    checks: {
      memory: process.memoryUsage().heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
      uptime: process.uptime() > 0 ? 'ok' : 'error'
    }
  };

  res.status(200).json(healthCheck);
});

/**
 * Hello Endpoint
 * Demonstrates secure API response with metadata
 */
app.get('/hello', (req, res) => {
  const response = {
    message: 'Hello from DevSecOps Backend!',
    timestamp: new Date().toISOString(),
    service: config.serviceName,
    version: config.version,
    environment: config.nodeEnv,
    securityHeaders: 'enabled',
    containerInfo: {
      hostname: process.env.HOSTNAME || 'local',
      platform: process.platform,
      nodeVersion: process.version
    }
  };

  res.status(200).json(response);
});

/**
 * API Info Endpoint
 * Provides API documentation and available endpoints
 */
app.get('/api/info', (req, res) => {
  const info = {
    name: 'DevSecOps Backend API',
    version: config.version,
    description: 'A secure backend API for DevSecOps demonstration',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check endpoint' },
      { method: 'GET', path: '/hello', description: 'Hello world endpoint with metadata' },
      { method: 'GET', path: '/api/info', description: 'API information and documentation' }
    ],
    security: {
      helmet: 'enabled',
      cors: 'restricted',
      rateLimiting: 'recommended for production'
    }
  };

  res.status(200).json(info);
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  
  // Don't leak error details in production
  const errorResponse = {
    error: 'Internal Server Error',
    message: config.nodeEnv === 'development' ? err.message : 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  };

  res.status(500).json(errorResponse);
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n[${signal}] Graceful shutdown initiated...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Start server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           DevSecOps Backend API Server                   ║
╠══════════════════════════════════════════════════════════╣
║  Status:      Running                                    ║
║  Port:        ${String(config.port).padEnd(42)}║
║  Environment: ${config.nodeEnv.padEnd(42)}║
║  Version:     ${config.version.padEnd(42)}║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
