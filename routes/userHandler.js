const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');

const saltRounds = 10; // Adjust for security level

// // // // Table Data CRUD
// // // // // Table Data Read Users
// // // // // // Get All Users
router.get('/get/users', async (req, res) => {
  const result = await db.runQuery('SELECT * FROM users');
  res.render('getUsers', { title: 'CRM Users', users: result.rows });
});

// // // // // // Get A Single User
router.get('/get/users/:user_id', async (req, res) => {
  const result = await db.runQuery(`SELECT * FROM users WHERE ID = $1`, [req.params.user_id]);
  result.rows.length > 0 ? res.render('getUser', { title: 'CRM User', user: result.rows[0] }) : res.send('There is no user with that ID. Please Try Again');
});



// // // // Table Data Create Users
// // // // // // Get Create User Page
router.get('/create/users', async (req, res) => {
  try {
    res.render('createUsers', { title: 'Create Users' });
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post New User
router.post('/create/users', async (req, res) => {
    const { username, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    var memberSince = new Date().toLocaleDateString();
    await db.runQuery('INSERT INTO users (username, password, email, member_since) VALUES ($1, $2, $3, $4)', [username, hashedPassword, email, memberSince]);
    res.redirect('/get/users');
});



// // // // Table Data Delete User
// // // // // // Delete Given User
router.post('/delete/users/:user_id', async (req, res) => {
  const results = await db.runQuery("DELETE FROM users WHERE ID = $1 RETURNING *", [req.params.user_id]);
  console.log('User deleted:', results.rows[0]);
  res.redirect('/get/users');
});



// // // // Table Data Update Users
// // // // // // Get Update User Page
router.get('/update/users/:user_id', async (req, res) => {
  try {
    const result = await db.runQuery(`SELECT * FROM users WHERE ID = $1`, [req.params.user_id]);
    if(result.rows.length > 0){
      res.render('updateUser', { title: 'Edit User', user: result.rows[0]});
    }
    else{
      res.send('There is no user with that ID. Please Try Again');
    }
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

// // // // // // Post Updates To A Given User
router.post('/update/users/:user_id', async (req, res) => {
  var { username, email, password } = req.body
  const user = await db.runQuery(`SELECT * FROM users WHERE ID = $1`, [req.params.user_id])
  console.log(user.rows[0])
  let finalPassword = user.rows[0].password; // Default to existing password
  if (password && password.trim() !== "" && password !== null && password !== undefined) {
    finalPassword = await bcrypt.hash(password, saltRounds); // Hash only if a new password is provided
  }
  const result = await db.runQuery(
    'UPDATE users SET username = $1, email = $2, password = $3 WHERE ID = $4 RETURNING *',
    [username, email, finalPassword, req.params.user_id]
  );
  console.log('User updated:', result.rows[0]);
  res.render('getUser', { title: 'CRM User', user: result.rows[0]});
});

module.exports = router;