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

const db = require('./db');

db.initializeDatabase();

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false
}));

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Method Override Middleware
app.use(methodOverride('_method'));

const usersRouter = require('./routes/userHandler');
const loginRouter = require('./routes/loginHandler');
// const adminRouter = require('./routes/adminHandler');
const statusRouter = require('./routes/statusHandler');
const clientsRouter = require('./routes/clientHandler');
const projectRouter = require('./routes/projectHandler');
const registerRouter = require('./routes/registerHandler');
const teamMembersRouter = require('./routes/teamMemberHandler');

app.use('/', usersRouter);
app.use('/', loginRouter);
// app.use('/', adminRouter);
app.use('/', statusRouter);
app.use('/', clientsRouter);
app.use('/', projectRouter);
app.use('/', registerRouter);
app.use('/', teamMembersRouter);

// Set the views directory
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'pug');

app.use(express.static('public'));
app.use(express.static('images'));


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});