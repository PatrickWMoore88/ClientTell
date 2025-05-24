const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

async function runQuery(query, params){
  try{
    return await pool.query(query, params);
  }
  catch(err){
    console.error("Database Query Error:", err);
    throw err;
  }
}

pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('Error connecting to PostgreSQL', err.stack));

module.exports = { pool, runQuery };