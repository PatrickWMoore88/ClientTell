const express = require('express');
const router = express.Router();
const db = require('../config/db');

// // // // Table Data CRUD
// // // // // Table Data Read Campaigns
// // // // // // Get All Campaigns
router.get('/get/campaigns', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM campaigns');
  res.render('getCampaigns', { title: 'Campaigns', campaigns: result.rows });
});


// // // // // // Get A Single Campaign
router.get('/get/campaigns/:id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM campaigns WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getCampaign', { title: 'Campaign', campaign: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Campaigns
// // // // // // Get Create Campaign Page
router.get('/create/campaigns', async (req, res) => {
  try {
    res.render('createCampaign', { title: 'Create Campaign' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Campaigns
router.post('/create/campaigns', async (req, res) => {
    const { client_id, name, type, budget, start_date, end_date, status } = req.body;
    var created_at = new Date().toLocaleDateString()
    // var due_date = new Date(issued_at); // Create a copy of issued_at
    // due_date.setDate(due_date.getDate() + 7); // Add 7 days
    // due_date.toLocaleDateString()
    await db.runQuery('INSERT INTO campaigns (client_id, name, type, budget, start_date, end_date, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [client_id, name, type, budget, start_date, end_date, status, created_at]);
    res.redirect('/get/campaigns');
});


// // // // Table Data Delete Campaigns
// // // // // // Delete Given Campaign
router.post('/delete/campaigns/:id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM campaigns WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Campaign Deleted:', results.rows[0]);
  res.redirect('/get/campaigns');
});



// // // // Table Data Update Campaigns
// // // // // // Get Update Campaign Page
router.get('/update/campaigns/:id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM campaigns WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateCampaign', { title: 'Update Campaign', campaign: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Invoice
router.post('/update/campaigns/:id', async (req, res) => {
  var { client_id, name, type, budget, start_date, end_date, status } = req.body
  const result = await db.runQuery(
      'UPDATE campaigns SET client_id = $1, name = $2, type = $3, budget = $4, start_date = $5, end_date = $6, status = $7 WHERE ID = $8 RETURNING *',
      [client_id, name, type, budget, start_date, end_date, status, req.params.id]
    );
  res.render('getCampaign', { title: 'Campaign', campaign: result.rows[0]});
});

module.exports = router;