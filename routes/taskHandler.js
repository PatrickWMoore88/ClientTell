const express = require('express');
const router = express.Router();
const db = require('../db');

// // // // Table Data CRUD
// // // // // Table Data Read Tasks
// // // // // // Get All Tasks
router.get('/get/tasks', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM tasks');
  res.render('getTasks', { title: 'Tasks', tasks: result.rows });
});


// // // // // // Get A Single Task
router.get('/get/tasks/:id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM tasks WHERE ID = $1`, [req.params.id]);
  result.rows.length > 0 ? res.render('getTask', { title: 'Task', task: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Tasks
// // // // // // Get Create Task Page
router.get('/create/tasks', async (req, res) => {
  try {
    res.render('createTask', { title: 'Create Task' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Task
router.post('/create/tasks', async (req, res) => {
    const { project_id, assigned_to, description, status } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO tasks (project_id, assigned_to, description, status, created_at) VALUES ($1, $2, $3, $4, $5)', [project_id, assigned_to, description, status, created_at]);
    res.redirect('/get/tasks');
});


// // // // Table Data Delete Tasks
// // // // // // Delete Given Task
router.post('/delete/tasks/:id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM tasks WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Task Deleted:', results.rows[0]);
  res.redirect('/get/tasks');
});



// // // // Table Data Update Tasks
// // // // // // Get Update Task Page
router.get('/update/tasks/:id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM tasks WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateTask', { title: 'Update Task', task: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Task
router.post('/update/tasks/:id', async (req, res) => {
  var { project_id, assigned_to, description, status } = req.body
  const result = await db.runQuery(
      'UPDATE tasks SET project_id = $1, assigned_to = $2, description = $3, status = $4 WHERE ID = $5 RETURNING *',
      [project_id, assigned_to, description, status, req.params.id]
    );
  res.render('getTask', { title: 'Task', task: result.rows[0]});
});

module.exports = router;