const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
  username: process.env.DB_USERNAME || process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || 'sr_foodkraft_dev',
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  dialect: 'mysql',
  logging: false, // Cleaner output
};

module.exports = {
  development: config,
  test: config,
  production: config
};
