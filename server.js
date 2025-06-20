require('dotenv').config();
const app = require('./clientTell');

const port = process.env.PORT

app.listen(port, () => {
  console.log(`Server up and running.`);
});