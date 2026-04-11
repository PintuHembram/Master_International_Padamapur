const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: '5mb' }));

const DB_PATH = path.join(__dirname, 'applications.json');
const USERS_DB_PATH = path.join(__dirname, 'users.json');
const STUDENTS_DB_PATH = path.join(__dirname, 'students.json');
const EXAMS_DB_PATH = path.join(__dirname, 'exams.json');
const EXAM_SUBJECTS_DB_PATH = path.join(__dirname, 'exam_subjects.json');
const RESULTS_DB_PATH = path.join(__dirname, 'student_results.json');

// Results database functions
function readResults() {
  try {
    if (!fs.existsSync(RESULTS_DB_PATH)) {
      fs.writeFileSync(RESULTS_DB_PATH, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(RESULTS_DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read results DB', err);
    return [];
  }
}

function writeResults(data) {
  try {
    fs.writeFileSync(RESULTS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write results DB', err);
    return false;
  }
}

// User database functions
function readUsers() {
  try {
    if (!fs.existsSync(USERS_DB_PATH)) {
      // Initialize with demo admin user
      const demoUsers = [{
        id: 1,
        fullName: 'Admin User',
        email: 'admin@mis.com',
        password: 'admin123', // In production, use bcrypt
        createdAt: new Date().toISOString()
      }];
      fs.writeFileSync(USERS_DB_PATH, JSON.stringify(demoUsers, null, 2));
      return demoUsers;
    }
    const raw = fs.readFileSync(USERS_DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read users DB', err);
    return [];
  }
}

function writeUsers(data) {
  try {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write users DB', err);
    return false;
  }
}

function readStudents() {
  try {
    if (!fs.existsSync(STUDENTS_DB_PATH)) {
      fs.writeFileSync(STUDENTS_DB_PATH, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(STUDENTS_DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read students DB', err);
    return [];
  }
}

function writeStudents(data) {
  try {
    fs.writeFileSync(STUDENTS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write students DB', err);
    return false;
  }
}

function readExams() {
  try {
    if (!fs.existsSync(EXAMS_DB_PATH)) {
      fs.writeFileSync(EXAMS_DB_PATH, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(EXAMS_DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read exams DB', err);
    return [];
  }
}

function writeExams(data) {
  try {
    fs.writeFileSync(EXAMS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write exams DB', err);
    return false;
  }
}

function readExamSubjects() {
  try {
    if (!fs.existsSync(EXAM_SUBJECTS_DB_PATH)) {
      fs.writeFileSync(EXAM_SUBJECTS_DB_PATH, JSON.stringify([]));
      return [];
    }
    const raw = fs.readFileSync(EXAM_SUBJECTS_DB_PATH, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Failed to read exam subjects DB', err);
    return [];
  }
}

function writeExamSubjects(data) {
  try {
    fs.writeFileSync(EXAM_SUBJECTS_DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Failed to write exam subjects DB', err);
    return false;
  }
}

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

// Basic root status page to help when opening the server in a browser
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Admissions API</title></head>
      <body style="font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial;margin:32px;">
        <h1>Admissions API</h1>
        <p>The API is running. Use the endpoints under <code>/api/</code>.</p>
        <ul>
          <li><a href="/api/applications">GET /api/applications</a> (returns 401 - admin only)</li>
          <li><a href="/api/applications/export">GET /api/applications/export</a> (public export - 401 in this setup)</li>
          <li><a href="/api/admin/applications">GET /api/admin/applications</a> (protected)</li>
        </ul>
      </body>
    </html>
  `);
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

// Simple admin auth: issue a token when credentials match
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admintoken';

// Sign Up endpoint
app.post('/api/admin/signup', (req, res) => {
  const { fullName, email, password } = req.body || {};
  
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  let users = readUsers();
  
  // Check if email already exists
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Create new user
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    fullName,
    email,
    password, // In production, hash this with bcrypt
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  writeUsers(users);

  return res.status(201).json({ 
    message: 'Account created successfully',
    user: { id: newUser.id, fullName, email }
  });
});

// Sign In endpoint
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body || {};
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  let users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  return res.json({ 
    token: ADMIN_TOKEN,
    name: user.fullName,
    email: user.email
  });
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

app.get('/api/students', (req, res) => {
  const students = readStudents();
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const payload = req.body || {};
  const required = ['roll_number', 'name', 'class', 'section', 'date_of_birth'];
  for (const key of required) {
    if (!payload[key]) {
      return res.status(400).json({ error: `${key} is required` });
    }
  }
  const students = readStudents();
  const id = Date.now().toString();
  const student = { id, ...payload };
  students.push(student);
  const ok = writeStudents(students);
  if (!ok) return res.status(500).json({ error: 'Failed to save student' });
  res.status(201).json(student);
});

app.delete('/api/students/:id', (req, res) => {
  const id = req.params.id;
  const students = readStudents();
  const idx = students.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  students.splice(idx, 1);
  const ok = writeStudents(students);
  if (!ok) return res.status(500).json({ error: 'Failed to delete student' });
  res.json({ success: true });
});

app.get('/api/exams', (req, res) => {
  const exams = readExams();
  res.json(exams);
});

app.post('/api/exams', (req, res) => {
  const payload = req.body || {};
  const required = ['name', 'academic_year'];
  for (const key of required) {
    if (!payload[key]) {
      return res.status(400).json({ error: `${key} is required` });
    }
  }
  const exams = readExams();
  const id = Date.now().toString();
  const exam = { id, ...payload };
  exams.push(exam);
  const ok = writeExams(exams);
  if (!ok) return res.status(500).json({ error: 'Failed to save exam' });
  res.status(201).json(exam);
});

app.delete('/api/exams/:id', (req, res) => {
  const id = req.params.id;
  const exams = readExams();
  const idx = exams.findIndex((e) => e.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Exam not found' });
  exams.splice(idx, 1);
  const ok = writeExams(exams);
  if (!ok) return res.status(500).json({ error: 'Failed to delete exam' });
  res.json({ success: true });
});

app.get('/api/exam_subjects', (req, res) => {
  const examSubjects = readExamSubjects();
  res.json(examSubjects);
});

app.post('/api/exam_subjects', (req, res) => {
  const payload = req.body || {};
  const required = ['exam_id', 'subject_name', 'exam_date'];
  for (const key of required) {
    if (!payload[key]) {
      return res.status(400).json({ error: `${key} is required` });
    }
  }
  const examSubjects = readExamSubjects();
  const id = Date.now().toString();
  const examSubject = { id, ...payload };
  examSubjects.push(examSubject);
  const ok = writeExamSubjects(examSubjects);
  if (!ok) return res.status(500).json({ error: 'Failed to save exam subject' });
  res.status(201).json(examSubject);
});

app.delete('/api/exam_subjects/:id', (req, res) => {
  const id = req.params.id;
  const examSubjects = readExamSubjects();
  const idx = examSubjects.findIndex((es) => es.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Exam subject not found' });
  examSubjects.splice(idx, 1);
  const ok = writeExamSubjects(examSubjects);
  if (!ok) return res.status(500).json({ error: 'Failed to delete exam subject' });
  res.json({ success: true });
});

// Student Results endpoints
app.get('/api/student_results', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const results = readResults();
  res.json(results);
});

app.post('/api/student_results', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const payload = req.body || {};
  const required = ['student_id', 'student_name', 'roll_number', 'exam_id', 'exam_name'];
  for (const key of required) {
    if (!payload[key]) {
      return res.status(400).json({ error: `${key} is required` });
    }
  }
  const results = readResults();
  const id = Date.now().toString();
  const result = { id, ...payload, created_at: new Date().toISOString() };
  results.push(result);
  const ok = writeResults(results);
  if (!ok) return res.status(500).json({ error: 'Failed to save result' });
  res.status(201).json(result);
});

app.put('/api/student_results/:id', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  const payload = req.body || {};
  const results = readResults();
  const idx = results.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Result not found' });
  
  results[idx] = { ...results[idx], ...payload };
  const ok = writeResults(results);
  if (!ok) return res.status(500).json({ error: 'Failed to update result' });
  res.json(results[idx]);
});

app.delete('/api/student_results/:id', (req, res) => {
  if (!verifyToken(req, res)) return res.status(401).json({ error: 'Unauthorized' });
  const id = req.params.id;
  const results = readResults();
  const idx = results.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Result not found' });
  results.splice(idx, 1);
  const ok = writeResults(results);
  if (!ok) return res.status(500).json({ error: 'Failed to delete result' });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Admissions API running on http://localhost:${PORT}`);
});
