const { Pool } = require('pg');
require('dotenv').config();

// Connect to PostgreSQL (Supabase or Local)
// It will prioritize DATABASE_URL if provided, otherwise fallback to individual variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ai_portfolio',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false // Supabase requires SSL
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
