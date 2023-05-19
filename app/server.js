'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// App
const app = express();
app.get('/', (req, res) => {
  console.log("GET  /");
  res.send('Hello World\n');
});

app.listen(PORT, () => {
  console.log(`Running on http://${HOST}:${PORT}`);
});
