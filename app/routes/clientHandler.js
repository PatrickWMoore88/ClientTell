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
// router.get('/get/clients/:id', async (req, res) => {
//   const result = await db.runQuery(`SELECT * FROM clients WHERE ID = $1`, [req.params.id]);
//   result.rows.length > 0 ? res.render('getClient', { title: 'Client', client: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
// });

router.get('/get/clients/:id', async (req, res) => {
  try {
    // Fetch Client Details
    const clientResult = await db.runQuery(
      `SELECT * FROM clients WHERE id = $1`, 
      [req.params.id]
    );
    
    if (clientResult.rows.length === 0) {
      return res.send('There is no user with that ID. Please Try Again');
    }

    // Fetch Related Projects, Invoices, and Campaigns
    const relatedDataQuery = `
      SELECT 
        p.id AS project_id, p.name AS project_name, p.status AS project_status,
        i.id AS invoice_id, i.amount, i.status AS invoice_status, i.due_date,
        cam.id AS campaign_id, cam.name AS campaign_name, cam.type AS campaign_type
      FROM clients c
      LEFT JOIN projects p ON p.client_id = c.id
      LEFT JOIN invoices i ON i.client_id = c.id
      LEFT JOIN campaigns cam ON cam.client_id = c.id
      WHERE c.id = $1;
    `;

    const relatedDataResult = await db.runQuery(relatedDataQuery, [req.params.id]);

    // Render Pug file with full dataset
    res.render('getClient', { 
      title: 'Client', 
      client: clientResult.rows[0],
      relatedData: relatedDataResult.rows 
    });

  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
});



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
    const result = await db.runQuery(`SELECT * FROM clients WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateClient', { title: 'Update Client', client: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Client
router.post('/update/clients/:id', async (req, res) => {
  var { name, email, phone, company_name, website_url, status } = req.body
  const result = await db.runQuery(
      'UPDATE clients SET name = $1, email = $2, phone = $3, company_name = $4, website_url = $5, status = $6 WHERE ID = $7 RETURNING *',
      [name, email, phone, company_name, website_url, status, req.params.id]
    );
  res.render('getClient', { title: 'Client', client: result.rows[0]});
});

module.exports = router;