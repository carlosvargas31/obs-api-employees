const express = require('express');
const router = require('./config/routes.config');

require('./config/mongo.config');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use('/api', router);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
