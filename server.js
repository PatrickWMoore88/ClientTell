require('dotenv').config();

// server.js (new file)
const app = require('./clientTell');

app.listen(process.env.PORT, () => {
  console.log(`Server running on port: ${process.env.PORT}`);
});