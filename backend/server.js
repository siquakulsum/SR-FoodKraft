const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Sync database (optional, better to use migrations)
// db.sequelize.sync(); 

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}

module.exports = app;
