const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../config/db');
const requireLogin = require('../middleware/auth');

// // // // Table Data CRUD
// // // // // Table Data Read Team Members
// // // // // // Get All Team Members
router.get('/get/team_members', requireLogin, async (req, res) => {
  const result = await db.runQuery('SELECT * FROM team_members');
  res.render('getTeamMembers', { title: 'Team Members', teamMembers: result.rows });
});


// // // // // // Get A Single Team Member
router.get('/get/team_members/:id', requireLogin, async (req, res) => {
  const result = await db.runQuery(`SELECT 
    tm.*,
    t.assigned_to AS assigned_member
  FROM team_members tm
  INNER JOIN tasks t ON t.assigned_to = tm.id
  WHERE tm.id = $1;`, [req.params.id]);
  result.rows.length > 0 ? res.render('getTeamMember', { title: 'Team Member', teamMember: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Team Members
// // // // // // Get Create Team Members Page
router.get('/create/team_members', requireLogin, async (req, res) => {
  try {
    res.render('createTeamMember', { title: 'Create Team Member' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New Team Member
router.post('/create/team_members', requireLogin, async (req, res) => {
    const { name, email, phone, role } = req.body;
    var created_at = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO team_members (name, email, phone, role, created_at) VALUES ($1, $2, $3, $4, $5)', [name, email, phone, role, created_at]);
    res.redirect('/get/team_members');
});



// // // // Table Data Delete Team Members
// // // // // // Delete Given Team Member
router.post('/delete/team_members/:id', requireLogin, async (req, res) => {
  const results = await db.runQuery("DELETE FROM team_members WHERE ID = $1 RETURNING *", [req.params.id]);
  console.log('Team Member deleted:', results.rows[0]);
  res.redirect('/get/team_members');
});



// // // // Table Data Update Team Members
// // // // // // Get Update Team Member Page
router.get('/update/team_members/:id', requireLogin, async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM team_members WHERE ID = $1`, [req.params.id]);
    result.rows.length > 0 ? res.render('updateTeamMember', { title: 'Update Team Member', teamMember: result.rows[0]}) : res.send('There is no client with that ID. Please Try Again');
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given Team Member
router.post('/update/team_members/:id', requireLogin, async (req, res) => {
  var { name, email, phone, role } = req.body
  const result = await db.runQuery(
      'UPDATE team_members SET name = $1, email = $2, phone = $3, role = $4 WHERE ID = $5 RETURNING *',
      [name, email, phone, role, req.params.id]
    );
  res.render('getTeamMember', { title: 'Team Member', teamMember: result.rows[0]});
});

module.exports = router;