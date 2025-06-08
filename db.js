require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function createTables() {
  const checkQuery = `SELECT 
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') AS clients_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') AS projects_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') AS invoices_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') AS campaigns_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') AS leads_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') AS tasks_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') AS team_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') AS users_exists;
  `;

  // Get existence status for each table
  const res = await pool.query(checkQuery);
  const exists = res.rows[0];

  console.log("Table existence check result:", exists); // Debugging

  const tableDefinitions = {
    clients: `CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20), company_name VARCHAR(255), website_url VARCHAR(255),
      status VARCHAR(50) CHECK (status IN ('Lead', 'Active', 'Inactive')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    projects: `CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY, client_id INT REFERENCES clients(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL, description TEXT, start_date DATE, deadline DATE,
      status VARCHAR(50) CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    invoices: `CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY, client_id INT REFERENCES clients(id) ON DELETE CASCADE,
      project_id INT REFERENCES projects(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(50) CHECK (status IN ('Pending', 'Paid', 'Overdue')),
      due_date DATE, issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    campaigns: `CREATE TABLE IF NOT EXISTS campaigns (
      id SERIAL PRIMARY KEY, client_id INT REFERENCES clients(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL, type VARCHAR(50) CHECK (type IN ('SEO', 'Google Ads', 'Social Media', 'Email Marketing')),
      budget NUMERIC(10,2), start_date DATE, end_date DATE,
      status VARCHAR(50) CHECK (status IN ('Active', 'Completed', 'Paused')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    leads: `CREATE TABLE IF NOT EXISTS leads (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20), source VARCHAR(255),
      status VARCHAR(50) CHECK (status IN ('New', 'Contacted', 'Converted', 'Lost')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    tasks: `CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY, project_id INT REFERENCES projects(id) ON DELETE CASCADE,
      assigned_to INT REFERENCES team_members(id) ON DELETE CASCADE, description TEXT NOT NULL, due_date DATE,
      status VARCHAR(50) CHECK (status IN ('Pending', 'In Progress', 'Completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    team: `CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(20), role VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`, 
    users: `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY, username VARCHAR(255) NOT NULL, email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL, member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
  };

  for (const [table, query] of Object.entries(tableDefinitions)) {
    if (!exists[`${table}_exists`]) {  // Only create if table doesn't exist
      await pool.query(query);
      console.log(`Table '${table}' created!`);
    } else {
      console.log(`Table '${table}' already exists, skipping creation.`);
    }
  }

  console.log("All tables checked/created.");
}

async function seedDatabase() {
  const saltRounds = 10; // Adjust for security level
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, saltRounds);

  const tablesToSeed = {
    clients: `
      INSERT INTO clients (name, email, phone, company_name, website_url, status)
      VALUES 
      ('John Doe', 'john@example.com', '123-456-7890', 'Doe Marketing', 'https://doemarketing.com', 'Active'),
      ('Jane Smith', 'jane@example.com', '987-654-3210', 'Smith Designs', 'https://smithdesigns.com', 'Lead');
    `,
    projects: `
      INSERT INTO projects (client_id, name, description, start_date, deadline, status)
      VALUES 
      (1, 'Website Redesign', 'Revamp client homepage for better UX', '2025-06-01', '2025-07-15', 'Planning'),
      (2, 'SEO Optimization', 'Improve search rankings for a client', '2025-06-10', '2025-07-30', 'In Progress');
    `,
    invoices: `
      INSERT INTO invoices (client_id, project_id, amount, status, due_date)
      VALUES 
      (1, 1, 1500.00, 'Pending', '2025-07-20'),
      (2, 2, 800.00, 'Paid', '2025-06-25');
    `,
    campaigns: `
      INSERT INTO campaigns (client_id, name, type, budget, start_date, end_date, status)
      VALUES 
      (1, 'Google Ads Campaign', 'Google Ads', 500.00, '2025-06-01', '2025-07-01', 'Active'),
      (2, 'Social Media Ads', 'Social Media', 300.00, '2025-06-15', '2025-07-15', 'Paused');
    `,
    leads: `
      INSERT INTO leads (name, email, phone, source, status)
      VALUES 
      ('Mark Johnson', 'mark@example.com', '555-1234', 'LinkedIn', 'Contacted'),
      ('Emily Davis', 'emily@example.com', '555-5678', 'Referral', 'New');
    `,
    tasks: `
      INSERT INTO tasks (project_id, assigned_to, description, due_date, status)
      VALUES 
      (1, 'John Developer', 'Create homepage wireframes', '2025-06-10', 'Pending'),
      (2, 'Jane SEO Expert', 'Keyword research', '2025-06-12', 'In Progress');
    `,
    team_members: `
      INSERT INTO team_members (name, email, role)
      VALUES 
      ('Alice Johnson', 'alice@example.com', 'Project Manager'),
      ('Bob White', 'bob@example.com', 'Frontend Developer');
    `,
    users: `
      INSERT INTO users (username, email, password)
      VALUES 
      ('Administrator', 'info@conversionwebdesign.com', '${hashedPassword}');
    `
  };

  for (const [table, query] of Object.entries(tablesToSeed)) {
    const checkDataQuery = `SELECT COUNT(*) FROM ${table};`;
    const res = await pool.query(checkDataQuery);
    const rowCount = parseInt(res.rows[0].count);

    if (rowCount === 0) {
      await pool.query(query);
      console.log(`Seed data added for '${table}'!`);
      console.log("Seeding database now...");
      console.log("Checking table existence before seeding:", await pool.query(checkDataQuery));
    } else {
      console.log(`Seed data already exists for '${table}', skipping.`);
    }
  }
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

async function initializeDatabase() {
  try {
    await createTables();  // Ensures tables are created first
    await seedDatabase();  // Runs after table checks, ensuring tables exist before seeding
    console.log("Database setup completed successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}


pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('Error connecting to PostgreSQL', err.stack));

module.exports = { pool, runQuery, initializeDatabase };