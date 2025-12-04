const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '5mb' }));

const DB_PATH = path.join(__dirname, 'applications.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
    }
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read DB', err);
    return [];
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write DB', err);
    return false;
  }
}

app.get('/api/applications', (req, res) => {
  // Public listing removed; require admin token
  return res.status(401).json({ error: 'Unauthorized' });
});

app.post('/api/applications', (req, res) => {
  const payload = req.body || {};
  // Basic validation
  const required = ['studentName', 'dob', 'classApplying', 'parentName', 'parentPhone', 'parentEmail'];
  for (const key of required) {
    if (!payload[key]) {
      return res.status(400).json({ error: `${key} is required` });
    }
  }

  const db = readDB();
  const id = Date.now();
  const row = {
    id,
    ...payload,
    createdAt: new Date().toISOString(),
  };
  db.push(row);
  const ok = writeDB(db);
  if (!ok) return res.status(500).json({ error: 'Failed to save application' });
  res.status(201).json({ success: true, id });
});

// Delete all applications (admin only - use with caution)
app.delete('/api/applications', (req, res) => {
  try {
    const ok = writeDB([]);
    if (!ok) return res.status(500).json({ error: 'Failed to clear applications' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to clear applications' });
  }
});

app.get('/api/applications/export', (req, res) => {
  return res.status(401).json({ error: 'Unauthorized' });
});

// Simple admin auth: issue a token when credentials match env vars
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admintoken';

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: ADMIN_TOKEN });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

function verifyToken(req, res) {
  const auth = req.headers.authorization || '';
  const parts = auth.split(' ');
  if (parts.length !== 2) return false;
  const token = parts[1];
  return token === ADMIN_TOKEN;
}

// Protected admin routes
app.get('/api/admin/applications', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const rows = readDB();
  res.json(rows);
});

app.get('/api/admin/applications/export', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const db = readDB();
  const headers = ['id','studentName','dob','classApplying','parentName','parentPhone','parentEmail','address','message','createdAt'];
  const rows = db.map((r) => headers.map((h) => {
    const v = r[h] ?? '';
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(','));
  const csv = headers.join(',') + '\n' + rows.join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="applications.csv"');
  res.send(csv);
});

app.delete('/api/admin/applications', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const ok = writeDB([]);
  if (!ok) return res.status(500).json({ error: 'Failed to clear applications' });
  return res.json({ success: true });
});

app.delete('/api/admin/applications/:id', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid id' });
  const db = readDB();
  const idx = db.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.splice(idx, 1);
  const ok = writeDB(db);
  if (!ok) return res.status(500).json({ error: 'Failed to delete' });
  return res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Admissions API running on http://localhost:${PORT}`);
});
