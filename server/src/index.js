import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import farmRoutes from './routes/farmRoutes.js';
import advisoryRoutes from './routes/advisoryRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'Agri Crop Advisory Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes (Mounted both with and without /api prefix for robust client compatibility)
app.use('/api/farms', farmRoutes);
app.use('/farms', farmRoutes);
app.use('/api/advisory', advisoryRoutes);
app.use('/advisory', advisoryRoutes);
app.use('/api/advisories', advisoryRoutes);
app.use('/advisories', advisoryRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[-] Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌾 Agri Crop Advisory Backend running on port ${PORT}`);
  console.log(`📡 Health Check: http://localhost:${PORT}/health`);
  console.log(`🌱 Farms API:   http://localhost:${PORT}/api/farms`);
  console.log(`🧠 Advisory API: http://localhost:${PORT}/api/advisory/generate`);
  console.log(`======================================================\n`);
});
