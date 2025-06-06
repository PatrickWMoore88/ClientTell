const express = require('express');
const router = express.Router();
const db = require('../db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Configure login strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await db.runQuery('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      console.warn('Login failed: User not found');
      return done(null, false, { message: 'User not found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.warn('Login failed: Incorrect password');
      return done(null, false, { message: 'Incorrect password' });
    }

    console.log('Login successful:', user.username);
    return done(null, user);
  } catch (err) {
    console.error('Error during login:', err);
    return done(err);
  }
}));


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.runQuery('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

router.use((req, res, next) => {
  res.locals.flashMessages = req.flash();
  next();
});


router.get('/login', async (req, res) => { 
    try {
    res.render('login', { title: 'User Login'});
  } catch (err) {
    console.error(err);
    res.send('Error ' + err);
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Error during authentication:', err);
      return next(err);
    }
    if (!user) {
      console.warn('Authentication failed:', info.message);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
      console.log('Redirecting to dashboard...');
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

router.get('/dashboard', (req, res) => {
  if (!req.user) {
    console.warn('No active session. Redirecting to login.');
    return res.redirect('/dashboard');
  }
  res.render('dashboard', { user: req.user });
});


module.exports = router;
