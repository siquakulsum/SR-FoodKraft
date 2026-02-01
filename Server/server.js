const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const path = require('path'); // Ensure path is imported

app.use(cors({
    origin: [
        'http://localhost:5173', 'http://localhost:5174',
        'http://127.0.0.1:5173', 'http://127.0.0.1:5174'
    ],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Debug logging for uploads
app.use('/uploads', (req, res, next) => {
    console.log(`[Upload Request] ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files statically (Absolute path)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./routes/authRoutes');
console.log('✓ Auth routes loaded');
app.use('/api/auth', authRoutes);
console.log('✓ Auth routes registered at /api/auth');

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/admin/profile', profileRoutes);

const inquiryRoutes = require('./routes/inquiryRoutes');
app.use('/api/inquiries', inquiryRoutes);

const cmsRoutes = require('./routes/cmsRoutes');
app.use('/api/cms', cmsRoutes);

const customerRoutes = require('./routes/customerRoutes');
app.use('/api/customers', customerRoutes);

const menuRoutes = require('./routes/menuRoutes');
app.use('/api/menu-items', menuRoutes);

const orderRoutes = require('./routes/orderRoutes');
app.use('/api/orders', orderRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const offersRoutes = require('./modules/offers/offersRoutes');
app.use('/api/offers', offersRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const { startCron } = require('./modules/offers/offersCron');
startCron();



// Test DB Connection
app.get('/health', async (req, res) => {
    try {
        await db.sequelize.authenticate();
        res.status(200).json({ status: 'ok', message: 'Database connected successfully' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Database connection failed', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.send('SR FoodKraft Backend API is running.');
});

// Global Error Handler - Must be after all routes
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Sync database
db.sequelize.sync({ alter: true }).then(() => {
    console.log('✓ Database schema synchronized');
});

if (require.main === module) {
    // Test database connection before starting server
    db.sequelize.authenticate()
        .then(() => {
            console.log('✓ Database connection established successfully');
            app.listen(PORT, () => {
                console.log(`✓ Server is running on port ${PORT}`);
                console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
            });
        })
        .catch((error) => {
            console.error('✗ Unable to connect to the database:', error.message);
            process.exit(1);
        });
}

module.exports = app;
