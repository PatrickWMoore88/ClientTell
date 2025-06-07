const express = require('express');
const router = express.Router();
const db = require('../db');

// // // // Table Data CRUD
// // // // // Table Data Read Clients
// // // // // // Get All Clients
router.get('/get/clients', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM clients');
  res.render('getClients', { title: 'Clients', clients: result.rows });
});


// // // // // // Get A Single Client
router.get('/get/clients/:id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM clients WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getClient', { title: 'Client', client: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Clients
// // // // // // Get Create Client Page
router.get('/create/clients', async (req, res) => {
  try {
    res.render('createClients', { title: 'Create Client' });
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