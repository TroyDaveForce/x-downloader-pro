require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- API routes ----
app.use('/api', downloadRoutes);

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'twittroyes' });
});

// ---- Fallback to index.html for any non-API route ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Twittroyes server running at http://localhost:${PORT}`);
});
