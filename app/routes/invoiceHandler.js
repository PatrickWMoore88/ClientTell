const express = require('express');
const router = express.Router();
const db = require('../config/db');

// // // // Table Data CRUD
// // // // // Table Data Read Invoices
// // // // // // Get All Invoices
router.get('/get/invoices', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM invoices');
  res.render('getInvoices', { title: 'Invoices', invoices: result.rows });
});


// // // // // // Get A Single Invoice
router.get('/get/invoices/:id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM invoices WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getInvoice', { title: 'Invoice', invoice: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Invoices
// // // // // // Get Create Invoice Page
router.get('/create/invoices', async (req, res) => {
  try {
    res.render('createInvoice', { title: 'Create Invoice' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Invoice
router.post('/create/invoices', async (req, res) => {
    const { client_id, project_id, amount, status, due_date } = req.body;
    var issued_at = new Date().toLocaleDateString()
    // var due_date = new Date(issued_at); // Create a copy of issued_at
    // due_date.setDate(due_date.getDate() + 7); // Add 7 days
    // due_date.toLocaleDateString()
    await db.runQuery('INSERT INTO invoices (client_id, project_id, amount, status, due_date, issued_at) VALUES ($1, $2, $3, $4, $5, $6)', [client_id, project_id, amount, status, due_date, issued_at]);
    res.redirect('/get/invoices');
});


// // // // Table Data Delete Invoices
// // // // // // Delete Given Invoice
router.post('/delete/invoices/:id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM invoices WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Invoice Deleted:', results.rows[0]);
  res.redirect('/get/invoices');
});



// // // // Table Data Update Invoices
// // // // // // Get Update Invoice Page
router.get('/update/invoices/:id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM invoices WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateInvoice', { title: 'Update Invoice', invoice: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Invoice
router.post('/update/invoices/:id', async (req, res) => {
  var { client_id, project_id, amount, status, due_date } = req.body
  const result = await db.runQuery(
      'UPDATE invoices SET client_id = $1, project_id = $2, amount = $3, status = $4, due_date = $5 WHERE ID = $6 RETURNING *',
      [client_id, project_id, amount, status, due_date, req.params.id]
    );
  res.render('getInvoice', { title: 'Invoice', invoice: result.rows[0]});
});

module.exports = router;