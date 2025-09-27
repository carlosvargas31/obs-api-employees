const express = require('express');
const router = require('./config/routes.config');

require('./config/mongo.config');

const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;

// Crear carpeta uploads/avatars si no existe
const avatarsDir = path.join(__dirname, '../uploads/avatars');
fs.mkdirSync(avatarsDir, { recursive: true });

app.use(express.json());
app.use('/api', router);
app.use('/uploads', express.static('uploads'));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.status) {
    res.status(err.status).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
