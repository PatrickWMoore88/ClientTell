const express = require('express');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// // // // Table Data CRUD
// // // // // Table Data Read Tasks
// // // // // // Get All Tasks
router.get('/get/tasks', requireLogin, async (req, res) => {
  try {
    // Fetch Invoice and Related Clients and Projects
    const taskDataQuery = `SELECT 
        t.*,
        p.id AS project_id, p.name AS project_name,
        tm.id AS team_member_id, tm.name AS team_member_name
      FROM tasks t
      LEFT JOIN projects p on p.id = t.project_id
      LEFT JOIN team_members tm on tm.id = t.assigned_to`;

    const result = await db.runQuery(taskDataQuery);

    res.render('getTasks', { title: 'Tasks', tasks: result.rows });
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// // // // // // Get A Single Task
router.get('/get/tasks/:id', requireLogin, async (req, res) => {
  try {
    // Fetch Invoice and Related Clients and Projects
    const taskDataQuery = `SELECT 
        t.*,
        p.id AS project_id, p.name AS project_name,
        tm.id AS team_member_id, tm.name AS team_member_name
      FROM tasks t
      LEFT JOIN projects p on p.id = t.project_id
      LEFT JOIN team_members tm on tm.id = t.assigned_to
      WHERE t.id = $1`;

    const result = await db.runQuery(taskDataQuery, [req.params.id]);

    result.rows.length > 0 ? res.render('getTask', { title: 'Task', task: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
  } catch (error) {
    console.error('Error fetching client data:', error);
    res.status(500).send('Internal Server Error');
  }
});



// // // // Table Data Create Tasks
// // // // // // Get Create Task Page
router.get('/create/tasks', requireLogin, async (req, res) => {
  try {
    const teamMembersResult = await db.runQuery(`SELECT id, name FROM team_members ORDER BY name`);
    const projectsResult = await db.runQuery(`SELECT id, name FROM projects ORDER BY name`);

    res.render('createTask', { 
      title: 'Create Task', 
      teamMembers: teamMembersResult.rows, 
      projects: projectsResult.rows 
    });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Task
router.post('/create/tasks', requireLogin, async (req, res) => {
    const { project_id, assigned_to, description, status, due_date } = req.body;
    // var created_at = new Date().toLocaleDateString();
    var created_at = new Date();
    await db.runQuery('INSERT INTO tasks (project_id, assigned_to, description, status, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6)', [project_id, assigned_to, description, status, due_date, created_at]);
    res.redirect('/get/tasks');
});


// // // // Table Data Delete Tasks
// // // // // // Delete Given Task
router.post('/delete/tasks/:id', requireLogin, async (req, res) => {
  const results = await db.runQuery("DELETE FROM tasks WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Task Deleted:', results.rows[0]);
  res.redirect('/get/tasks');
});



// // // // Table Data Update Tasks
// // // // // // Get Update Task Page
router.get('/update/tasks/:id', requireLogin, async (req, res) => {
  try {
    const teamMembersResult = await db.runQuery(`SELECT id, name FROM team_members ORDER BY name`);
    const projectsResult = await db.runQuery(`SELECT id, name FROM projects ORDER BY name`);
    const result = await db.runQuery(`SELECT id, project_id, assigned_to, description, status,
                 TO_CHAR(due_date, 'YYYY-MM-DD') AS due_date,
                 TO_CHAR(created_at, 'YYYY-MM-DD') AS created_at
          FROM tasks WHERE id = $1`, [req.params.id]);
    res.render('updateTask', { title: 'Update Task', task: result.rows[0], teamMembers: teamMembersResult.rows, projects: projectsResult.rows})
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Task
router.post('/update/tasks/:id', requireLogin, async (req, res) => {
  try {
    var { project_id, assigned_to, description, status, due_date } = req.body
    await db.runQuery(
        'UPDATE tasks SET project_id = $1, assigned_to = $2, description = $3, status = $4, due_date = $5 WHERE ID = $6 RETURNING *',
        [project_id, assigned_to, description, status, due_date, req.params.id]
      );
    const result = await db.runQuery(`
      SELECT 
        t.*,
        tm.name AS team_member_name
      FROM tasks t
      LEFT JOIN team_members tm ON t.assigned_to = tm.id
      WHERE t.id = $1;
    `, [req.params.id]);
    res.render('getTask', { title: 'Task', task: result.rows[0]});
  } catch (error) {
    console.error('Error fetching dropdown data:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;