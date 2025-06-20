const express = require('express');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// // // // Table Data CRUD
// // // // // Table Data Read Leads
// // // // // // Get All Leads
router.get('/get/leads', requireLogin, async (req, res) => {
  const result = await db.runQuery('SELECT * FROM leads');
  res.render('getLeads', { title: 'Leads', leads: result.rows });
});


// // // // // // Get A Single Lead
router.get('/get/leads/:id', requireLogin, async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM leads WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getLead', { title: 'Lead', lead: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Leads
// // // // // // Get Create Lead Page
router.get('/create/leads', requireLogin, async (req, res) => {
  try {
    res.render('createLead', { title: 'Create Lead' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Lead
router.post('/create/leads', requireLogin, async (req, res) => {
    const { name, email, phone, source, status } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO leads (name, email, phone, source, status, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [name, email, phone, source, status, created_at]);
    res.redirect('/get/leads');
});



// // // // Table Data Delete Leads
// // // // // // Delete Given Lead
router.post('/delete/leads/:id', requireLogin, async (req, res) => {
  const results = await db.runQuery("DELETE FROM leads WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Lead deleted:', results.rows[0]);
  res.redirect('/get/leads');
});



// // // // Table Data Update Leads
// // // // // // Get Update Lead Page
router.get('/update/leads/:id', requireLogin, async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT id, name, email, phone, source, status,
                  TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
          FROM leads WHERE id = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateLead', { title: 'Update Lead', lead: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Lead
router.post('/update/leads/:id', requireLogin, async (req, res) => {
  var { name, email, phone, source, status } = req.body
  const result = await db.runQuery(
      'UPDATE leads SET name = $1, email = $2, phone = $3, source = $4, status = $5 WHERE ID = $6 RETURNING *',
      [name, email, phone, source, status, req.params.id]
    );
  res.render('getLead', { title: 'Lead', lead: result.rows[0]});
});

module.exports = router;