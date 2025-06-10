const express = require('express');
const router = express.Router();
const db = require('../config/db');

// // // // Table Data CRUD
// // // // // Table Data Read Clients
// // // // // // Get All Clients
router.get('/get/clients', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM clients');
  res.render('getClients', { title: 'Clients', clients: result.rows });
});


// // // // // // Get A Single Client
router.get('/get/clients/:id', async (req, res) => {
  try{
    // Fetch client details
    const clientResult = await db.runQuery(`SELECT * FROM clients WHERE id = $1`, [req.params.id]);

    if (clientResult.rows.length === 0) {
      return res.send('There is no user with that ID. Please Try Again');
    }

    // Fetch each category separately
    const projectsResult = await db.runQuery(`SELECT id AS project_id, name AS project_name, status AS project_status FROM projects WHERE client_id = $1`, [req.params.id]);
    const invoicesResult = await db.runQuery(`SELECT id AS invoice_id, amount, status AS invoice_status, due_date FROM invoices WHERE client_id = $1`, [req.params.id]);
    const campaignsResult = await db.runQuery(`SELECT id AS campaign_id, name AS campaign_name, type AS campaign_type FROM campaigns WHERE client_id = $1`, [req.params.id]);
    
    // Render page with organized data
    res.render('getClient', {  
      title: 'Client',  
      client: clientResult.rows[0],  
      projects: projectsResult.rows,  
      invoices: invoicesResult.rows,  
      campaigns: campaignsResult.rows  
    });
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
})



// // // // Table Data Create Clients
// // // // // // Get Create Client Page
router.get('/create/clients', async (req, res) => {
  try {
    res.render('createClient', { title: 'Create Client' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Client
router.post('/create/clients', async (req, res) => {
    const { name, email, phone, company_name, website_url, status } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO clients (name, email, phone, company_name, website_url, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [name, email, phone, company_name, website_url, status, created_at]);
    res.redirect('/get/clients');
});



// // // // Table Data Delete Clients
// // // // // // Delete Given Client
router.post('/delete/clients/:id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM clients WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Client deleted:', results.rows[0]);
  res.redirect('/get/clients');
});



// // // // Table Data Update Clients
// // // // // // Get Update Client Page
router.get('/update/clients/:id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT id, name, email, phone, company_name, website_url, status,
              TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
      FROM clients WHERE id = $1`, [req.params.id]);

    result.rows.length > 0 ? res.render('updateClient', { title: 'Update Client', client: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// // // // // // Post Updates To A Given Client
router.post('/update/clients/:id', async (req, res) => {
  var { name, email, phone, company_name, website_url, status, created_at } = req.body
  const result = await db.runQuery(
      'UPDATE clients SET name = $1, email = $2, phone = $3, company_name = $4, website_url = $5, status = $6, created_at = $7 WHERE ID = $8 RETURNING *',
      [name, email, phone, company_name, website_url, status, created_at, req.params.id]
    );
  res.render('getClient', { title: 'Client', client: result.rows[0]});
});

module.exports = router;