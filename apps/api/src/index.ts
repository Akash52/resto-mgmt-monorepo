import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { restaurantRouter } from './routes/restaurants.js';
import { menuRouter } from './routes/menu.js';
import { orderRouter } from './routes/orders.js';
import { billingConfigRouter } from './routes/billing-config.js';
import { rulesRouter } from './routes/rules.js';
import { couponRouter } from './routes/coupons.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/restaurants', restaurantRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', orderRouter);
app.use('/api/billing-config', billingConfigRouter);
app.use('/api/rules', rulesRouter);
app.use('/api/coupons', couponRouter);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Restaurant API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
});
