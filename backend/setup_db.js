const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setup() {
    try {
        console.log("Connecting to Supabase...");
        const schema = fs.readFileSync('../database/schema.sql', 'utf8');
        await pool.query(schema);
        console.log("Successfully created tables in Supabase!");
    } catch (error) {
        console.error("Error setting up tables:", error);
    } finally {
        pool.end();
    }
}
setup();
