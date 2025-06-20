const express = require('express');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// // // // Table Data CRUD
// // // // // Table Data Read Projects
// // // // // // Get All Projects
router.get('/get/projects', requireLogin, async (req, res) => {
  const projectDataQuery = `SELECT 
      p.*,
      c.id AS client_id, c.name AS client_name
    FROM projects p
    LEFT JOIN clients c on c.id = p.client_id`;
  
  const result = await db.runQuery(projectDataQuery);
  res.render('getProjects', { title: 'Projects', projects: result.rows });
});


// // // // // // Get A Single Project
router.get('/get/projects/:id', requireLogin, async (req, res) => {
  try {
      const projectDataQuery = `SELECT 
          p.*,
          c.id AS client_id, c.name AS client_name
        FROM projects p
        LEFT JOIN clients c on c.id = p.client_id
        WHERE p.id = $1`;
      
      const result = await db.runQuery(projectDataQuery, [req.params.id]);
      console.log(result.rows[0])
      result.rows.length > 0 ? res.render('getProject', { title: 'Project', project: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
    } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
});



// // // // Table Data Create Projects
// // // // // // Get Create Project Page
router.get('/create/projects', requireLogin, async (req, res) => {
  try {
    const clientsResult = await db.runQuery(`SELECT id, name FROM clients ORDER BY name`);
    res.render('createProject', { title: 'Create Project', clients: clientsResult.rows });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Project
router.post('/create/projects', requireLogin, async (req, res) => {
    const { client_id, name, description, start_date, deadline, status } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO projects (client_id, name, description, start_date, deadline, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [client_id, name, description, start_date, deadline, status, created_at]);
    res.redirect('/get/projects');
});


// // // // Table Data Delete Projects
// // // // // // Delete Given Project
router.post('/delete/projects/:id', requireLogin, async (req, res) => {
  const results = await db.runQuery("DELETE FROM projects WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Project Deleted:', results.rows[0]);
  res.redirect('/get/projects');
});



// // // // Table Data Update Projects
// // // // // // Get Update Project Page
router.get('/update/projects/:id', requireLogin, async (req, res) => {
  try {
    const clientsResult = await db.runQuery(`SELECT id, name FROM clients ORDER BY name`);
    const result = await db.runQuery(`SELECT id, client_id, name, description, status,
                 TO_CHAR(start_date, 'YYYY-MM-DD') AS start_date, 
                 TO_CHAR(deadline, 'YYYY-MM-DD') AS deadline
          FROM projects WHERE id = $1`, [req.params.id]);
    res.render('updateProject', { title: 'Update Project', project: result.rows[0], clients: clientsResult.rows})
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Project
router.post('/update/projects/:id', requireLogin, async (req, res) => {
  try {
    var { client_id, name, description, start_date, deadline, status } = req.body
    await db.runQuery(
        'UPDATE projects SET client_id = $1, name = $2, description = $3, start_date = $4, deadline = $5, status = $6 WHERE ID = $7 RETURNING *',
        [client_id, name, description, start_date, deadline, status, req.params.id]
      );
    const result = await db.runQuery(`
        SELECT 
          p.*,
          c.name AS client_name
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        WHERE p.id = $1;
      `, [req.params.id]);

    res.render('getProject', { title: 'Project', project: result.rows[0]});
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;