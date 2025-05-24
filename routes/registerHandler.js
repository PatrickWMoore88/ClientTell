const express = require('express');
const router = express.Router();
const db = require('../db');
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
  const hashedPassword = await bcrypt.hash(password, 10);

  await db.runQuery('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
  res.redirect('/login');
});

module.exports = router;