// server.js (new file)
const app = require('./clientTell');
const port = 3000;

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});