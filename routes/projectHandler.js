const express = require('express');
const router = express.Router();
const db = require('../db');

// // // // Table Data CRUD
// // // // // Table Data Read Projects
// // // // // // Get All Projects
router.get('/get/projects', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM projects');
  res.render('getProjects', { title: 'Projects', projects: result.rows });
});


// // // // // // Get A Single Project
router.get('/get/projects/:id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM projects WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getProject', { title: 'Project', project: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Projects
// // // // // // Get Create Project Page
router.get('/create/projects', async (req, res) => {
  try {
    res.render('createProject', { title: 'Create Project' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Project
router.post('/create/projects', async (req, res) => {
    const { client_id, name, description, start_date, deadline, status } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO projects (client_id, name, description, start_date, deadline, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)', [client_id, name, description, start_date, deadline, status, created_at]);
    res.redirect('/get/projects');
});


// // // // Table Data Delete Projects
// // // // // // Delete Given Project
router.post('/delete/projects/:id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM projects WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Project Deleted:', results.rows[0]);
  res.redirect('/get/projects');
});



// // // // Table Data Update Projects
// // // // // // Get Update Project Page
router.get('/update/projects/:id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM projects WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateProject', { title: 'Update Project', project: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Project
router.post('/update/projects/:id', async (req, res) => {
  var { client_id, name, description, start_date, deadline, status } = req.body
  const result = await db.runQuery(
      'UPDATE projects SET client_id = $1, name = $2, description = $3, start_date = $4, deadline = $5, status = $6 WHERE ID = $7 RETURNING *',
      [client_id, name, description, start_date, deadline, status, req.params.id]
    );
  res.render('getProject', { title: 'Project', project: result.rows[0]});
});

module.exports = router;