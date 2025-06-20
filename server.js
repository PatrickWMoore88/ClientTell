require('dotenv').config();
const app = require('./clientTell');

// const port = process.env.PORT;
const port = 3000;

app.listen(port, () => {
  console.log(`Server up and running.`);
});