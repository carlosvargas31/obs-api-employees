const express = require('express');
const router = require('./config/routes.config');

require('./config/mongo.config');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
