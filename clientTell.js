require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const app = express();
const port = 3000;

const db = require('./app/config/db');

db.initializeDatabase();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000 * 60 * 60} // 1 hour
}));

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// // Custom Middleware
// app.use((req, res, next) => {
//   console.log(`➡️ ${req.method} ${req.originalUrl}`);
//   next();
// });

// Method Override Middleware
app.use(methodOverride('_method'));

const homeRouter = require('./app/routes/homeHandler');
const leadRouter = require('./app/routes/leadHandler');
const taskRouter = require('./app/routes/taskHandler');
const usersRouter = require('./app/routes/userHandler');
const loginRouter = require('./app/routes/loginHandler');
// const adminRouter = require('./app/routes/adminHandler');
const statusRouter = require('./app/routes/statusHandler');
const clientRouter = require('./app/routes/clientHandler');
const invoiceRouter = require('./app/routes/invoiceHandler');
const projectRouter = require('./app/routes/projectHandler');
const campaignRouter = require('./app/routes/campaignHandler');
const registerRouter = require('./app/routes/registerHandler');
const teamMembersRouter = require('./app/routes/teamMemberHandler');

app.use('/', homeRouter);
app.use('/', leadRouter);
app.use('/', taskRouter);
app.use('/', usersRouter);
app.use('/', loginRouter);
// app.use('/', adminRouter);
app.use('/', statusRouter);
app.use('/', clientRouter);
app.use('/', invoiceRouter);
app.use('/', projectRouter);
app.use('/', campaignRouter);
app.use('/', registerRouter);
app.use('/', teamMembersRouter);

// Set the views directory
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.static('images'));

module.exports = app;