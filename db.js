const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
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