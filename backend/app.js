require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes      = require('./routes/authRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const productRoutes   = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const billingRoutes   = require('./routes/billingRoutes');
const reportsRoutes   = require('./routes/reportsRoutes');
const whatsappRoutes  = require('./routes/whatsappRoutes');
const razorpayRoutes  = require('./routes/razorpayRoutes');
const inquiryRoutes   = require('./routes/inquiryRoutes');
const userRoutes      = require('./routes/userRoutes');
const feedbackRoutes  = require('./routes/feedbackRoutes');
const chatRoutes      = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

const path = require('path');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/auth',       authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/inventory',  inventoryRoutes);
app.use('/api/billing',    billingRoutes);
app.use('/api/reports',    reportsRoutes);
app.use('/api/whatsapp',   whatsappRoutes);
app.use('/api/razorpay',   razorpayRoutes);
app.use('/api/inquiry',    inquiryRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/feedback',   feedbackRoutes);
app.use('/api/chat',       chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart',       require('./routes/cartRoutes'));

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Initialize Cron Jobs
const { initAbandonedCartCron } = require('./services/abandonedCartService');
initAbandonedCartCron();

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

module.exports = app;
