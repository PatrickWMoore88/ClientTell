const express = require('express');
const router = express.Router();
const db = require('../config/db');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const requireLogin = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Configure login strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const result = await db.runQuery('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      console.warn('Login failed: Username or Password Not Found');
      return done(null, false, { message: 'Login failed: Username or Password Not Found' });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.warn('Login Failed: Incorrect Username or Password');
      return done(null, false, { message: 'Username or Password' });
    }

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
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

router.get('/dashboard', requireLogin, async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM clients) AS total_clients,
        (SELECT COUNT(*) FROM clients WHERE status = 'Lead') AS leads_clients,
        (SELECT COUNT(*) FROM clients WHERE status = 'Active') AS active_clients,
        (SELECT COUNT(*) FROM clients WHERE status = 'Inactive') AS inactive_clients,

        (SELECT COUNT(*) FROM projects) AS total_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'Planning') AS planning_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'In Progress') AS in_progress_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'On Hold') AS on_hold_projects,
        (SELECT COUNT(*) FROM projects WHERE status = 'Completed') AS completed_projects,

        (SELECT COUNT(*) FROM invoices WHERE EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS total_invoices,
        (SELECT COUNT(*) FROM invoices WHERE status = 'Pending' 
          AND EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS pending_invoices,
        (SELECT COUNT(*) FROM invoices WHERE status = 'Overdue' 
          AND EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS overdue_invoices,
        (SELECT COUNT(*) FROM invoices WHERE status = 'Paid' 
          AND EXTRACT(MONTH FROM issued_at) = EXTRACT(MONTH FROM CURRENT_DATE) 
          AND EXTRACT(YEAR FROM issued_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS paid_invoices,

        (SELECT COUNT(*) FROM campaigns) AS total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'Active') AS active_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'Paused') AS paused_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'Completed') AS completed_campaigns,

        (SELECT COUNT(*) FROM leads) AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'New') AS new_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Contacted') AS contacted_leads,
        (SELECT COUNT(*) FROM leads WHERE status = 'Converted') AS converted_leads,
        (SELECT COUNT(*) FROM leads WHERE source = 'Referral') AS referral_leads,
        (SELECT COUNT(*) FROM leads WHERE source = 'Facebook') AS facebook_leads,
        (SELECT COUNT(*) FROM leads WHERE source = 'Nextdoor') AS nextdoor_leads,
        (SELECT COUNT(*) FROM leads WHERE source = 'Cold Call') AS cold_call_leads,

        (SELECT COUNT(*) FROM tasks) AS total_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Pending') AS pending_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'In Progress') AS in_progress_tasks,
        (SELECT COUNT(*) FROM tasks WHERE status = 'Completed') AS completed_tasks
    `;

    const result = await db.runQuery(statsQuery);
    res.render('dashboard', { title: 'Dashboard', user: req.user, admin: process.env.ADMIN_NAME, stats: result.rows[0] });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Error logging out');
    }

    // Optionally clear user data from session if you're manually attaching it
    req.session.destroy(() => {
      res.redirect('/login'); // or home, your choice
    });
  });
});



module.exports = router;
