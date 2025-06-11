const express = require('express');
const router = express.Router();
const db = require('../config/db');

// // // // // // About Us Page
router.get('/about', async (req, res) => {
  res.render('aboutUs', { title: 'About Us'});
});


// // // // // // Contact Us Page
router.get('/contact', async (req, res) => {
  res.render('contactUs', { title: 'Contact Us'});
})

// // // // // // Contact Us Page Post
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    await db.runQuery(`
      INSERT INTO contact_requests (name, email, message) 
      VALUES ($1, $2, $3)
    `, [name, email, message]);

    res.render('index', { title: 'Contact Us'});

  } catch (error) {
    console.error("Error saving contact request:", error);
    res.status(500).send("Something went wrong—please try again.");
  }
});


module.exports = router;