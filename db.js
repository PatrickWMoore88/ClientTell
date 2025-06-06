const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function createTables() {
  const checkQuery = `SELECT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers'
  );`;

  const res = await pool.query(checkQuery);
  const tableExists = res.rows[0].exists;

  if (!tableExists) {
    const createQuery = `
      CREATE TABLE customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `;
    await pool.query(createQuery);
    console.log('Table created!');
    await seedDatabase();
    console.log("Seeding data now.");
  } else {
    console.log('Table already exists, skipping creation.');
  }
}

async function seedDatabase() {
  const query = `
    INSERT INTO customers (name, email) VALUES 
    ('Alice', 'alice@example.com'), 
    ('Bob', 'bob@example.com');
  `;
  await pool.query(query);
  console.log('Database seeded!');
}

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

module.exports = { pool, runQuery, createTables };