require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const schema = require('./schema');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

const orderedTables = ['users', 'contact', 'clients', 'projects', 'invoices', 'campaigns', 'leads', 'team', 'tasks'];

async function loopTables(tables){
  for (const table of tables){
    // Make adjustments for edge cases "contact" and "team"
    const realTable = resolveTableName(table);
    
    // Ensures tables are created first
    await createTables(table, realTable);
    
    // Runs after table checks, ensuring tables exist before seeding
    await seedDatabase(realTable);
    
  }
}

async function runSeed(table, query, values = []) {
  const { rows } = await runQuery(`SELECT COUNT(*) FROM ${table};`);
  if (+rows[0].count === 0) {
    await runQuery(query, values);
    console.log(`✅ Seeded '${table}'`);
  } else {
    console.log(`ℹ️ '${table}' already seeded`);
  }
}

function resolveTableName(table){
  const lookup = {
    contact: 'contact_requests',
    team: 'team_members'
  };

  return lookup[table] || table;
}

async function runQuery(query, params){
  try{
    if(params){
      return await pool.query(query, params);
    }
    else{
      return await pool.query(query);
    }
  }
  catch(err){
    console.error("Database Query Error:", err);
    throw err;
  }
}

async function createTables(table, realTable) {
  // Get existence status for each table
  const res = await runQuery(schema.checkQuery);
  const exists = res.rows[0];

  // // Debugging
  // console.log("Table existence check result:", exists); 
  
  if (!exists[`${table}_exists`]) {
    const query = schema.tableDefinitions[table];
    await runQuery(query);
    console.log(`ℹ️ '${realTable}' checked/created.`);
  } else {
    console.log(`ℹ️ '${realTable}' already exists, skipping creation.`);
  }
}

async function seedDatabase(table) {
  const query = schema.dataToSeed[table];

  if (!query) {
    console.warn(`⚠️ No seed data defined for '${table}', skipping.`);
    return;
  }

  switch(table){
    case "users":
      // Adjust salt rounds for security level
      const saltRounds = 10;
      const hashedTestPassword = await bcrypt.hash("Test", saltRounds)
      const hashedAdminPassword = await bcrypt.hash(process.env.ADMIN_PASS, saltRounds);
      await runSeed(table, query, [hashedTestPassword, process.env.ADMIN_NAME, process.env.ADMIN_EMAIL, hashedAdminPassword]);
      break;
    default:
      await runSeed(table, query);
      break;
  }
}

async function initializeDatabase() {
  await runQuery('BEGIN');
  console.error("Starting DB Deployment Process");
  try {
    await loopTables(orderedTables);
    await runQuery('COMMIT');
    console.error("DB Deployed Properly");
  } catch (err) {
    await runQuery('ROLLBACK');
    console.error("ERROR: Rolling Back DB");
    throw err;
  }
}


pool.on('connect', () => console.log('Connected to PostgreSQL'));
pool.on('error', (err) => console.error('Error connecting to PostgreSQL', err.stack));

module.exports = { pool, runQuery, initializeDatabase };