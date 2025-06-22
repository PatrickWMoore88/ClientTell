const express = require('express');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// // // // Table Data CRUD
// // // // // Table Data Read Campaigns
// // // // // // Get All Campaigns
router.get('/get/campaigns', requireLogin, async (req, res) => {
  const campaignDataQuery = `SELECT 
      cam.*,
      c.id AS client_id, c.name AS client_name
    FROM campaigns cam
    LEFT JOIN clients c on c.id = cam.client_id`;
  
  const result = await db.runQuery(campaignDataQuery);
  res.render('getCampaigns', { title: 'Campaigns', campaigns: result.rows });
});


// // // // // // Get A Single Campaign
router.get('/get/campaigns/:id', requireLogin, async (req, res) => {
  try {
    // Fetch Invoice and Related Clients and Projects
    const campaignDataQuery = `SELECT 
        cam.*,
        c.id AS client_id, c.name AS client_name
      FROM campaigns cam
      LEFT JOIN clients c on c.id = cam.client_id
      WHERE cam.id = $1`;

    const result = await db.runQuery(campaignDataQuery, [req.params.id]);

    result.rows.length > 0 ? res.render('getCampaign', { title: 'Campaign', campaign: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
  });



// // // // Table Data Create Campaigns
// // // // // // Get Create Campaign Page
router.get('/create/campaigns', requireLogin, async (req, res) => {
  try {
    const clientsResult = await db.runQuery(`SELECT id, name FROM clients ORDER BY name`);

    res.render('createCampaign', { 
      title: 'Create Campaign', 
      clients: clientsResult.rows
    });
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// // // // // // Post New Campaigns
router.post('/create/campaigns', requireLogin, async (req, res) => {
    const { client_id, name, type, budget, start_date, end_date, status } = req.body;
    var created_at = new Date().toLocaleDateString()
    await db.runQuery('INSERT INTO campaigns (client_id, name, type, budget, start_date, end_date, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [client_id, name, type, budget, start_date, end_date, status, created_at]);
    res.redirect('/get/campaigns');
});


// // // // Table Data Delete Campaigns
// // // // // // Delete Given Campaign
router.post('/delete/campaigns/:id', requireLogin, async (req, res) => {
  const results = await db.runQuery("DELETE FROM campaigns WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Campaign Deleted:', results.rows[0]);
  res.redirect('/get/campaigns');
});



// // // // Table Data Update Campaigns
// // // // // // Get Update Campaign Page
router.get('/update/campaigns/:id', requireLogin, async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT id, name, type, budget, 
             TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, 
             TO_CHAR(end_date, 'YYYY-MM-DD') AS end_date, 
             status 
      FROM campaigns WHERE id = $1`, [req.params.id]);
    const clientsResult = await db.runQuery(`SELECT id, name FROM clients ORDER BY name`);

    res.render('updateCampaign', { title: 'Update Campaign', campaign: result.rows[0], clients: clientsResult.rows})
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// // // // // // Post Updates To A Given Invoice
router.post('/update/campaigns/:id', requireLogin, async (req, res) => {
  try {
    var { client_id, name, type, budget, start_date, end_date, status } = req.body
    await db.runQuery(
        'UPDATE campaigns SET client_id = $1, name = $2, type = $3, budget = $4, start_date = $5, end_date = $6, status = $7 WHERE ID = $8 RETURNING *',
        [client_id, name, type, budget, start_date, end_date, status, req.params.id]
      );
    const result = await db.runQuery(`
          SELECT 
            cam.*,
            c.name AS client_name
          FROM campaigns cam
          LEFT JOIN clients c ON cam.client_id = c.id
          WHERE cam.id = $1;
        `, [req.params.id]);

    res.render('getCampaign', { title: 'Campaign', campaign: result.rows[0]});
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;