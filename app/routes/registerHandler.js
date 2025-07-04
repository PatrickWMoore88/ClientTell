const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');

router.get('/register', async (req, res) => { 
    try {
        res.render('register', { title: 'User Registration'});
  } catch (err) {
        console.error(err);
        res.send('Error ' + err);
  }
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const saltRounds = 10; // Adjust for security level
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  await db.runQuery('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
  res.redirect('/login');
});

module.exports = router;