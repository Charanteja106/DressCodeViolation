const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

// Import open with dynamic import workaround
let open;
(async () => {
  open = (await import('open')).default;
})();

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (latest driver options, no deprecated options)
mongoose.connect('mongodb://127.0.0.1:27017/dress_code_db');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('MongoDB connected'));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
});
const violationSchema = new mongoose.Schema({
  studentId: String,
  violations: [String],
  status: { type: String, default: 'Pending' },
  timestamp: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Violation = mongoose.model('Violation', violationSchema);

// Routes here same as before...

// Registration
app.post('/register/faculty', async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username, role: 'faculty' })) {
    return res.status(400).json({ message: 'Faculty username exists' });
  }
  await new User({ username, password, role: 'faculty' }).save();
  res.json({ message: 'Faculty registration successful' });
});

app.post('/register/hod', async (req, res) => {
  const { username, password } = req.body;
  if (await User.findOne({ username, role: 'hod' })) {
    return res.status(400).json({ message: 'HOD username exists' });
  }
  await new User({ username, password, role: 'hod' }).save();
  res.json({ message: 'HOD registration successful' });
});

// Login
app.post('/login/faculty', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password, role: 'faculty' });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'Faculty login successful' });
});

app.post('/login/hod', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password, role: 'hod' });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ message: 'HOD login successful' });
});

// Violation APIs follow your existing logic...

app.post('/api/violations', async (req, res) => {
  const violation = new Violation(req.body);
  await violation.save();
  res.json({ message: 'Violation submitted for approval' });
});

app.get('/api/violations', async (req, res) => {
  const violations = await Violation.find();
  res.json(violations);
});

app.post('/api/violations/:id/approve', async (req, res) => {
  await Violation.findByIdAndUpdate(req.params.id, { status: 'Approved' });
  res.json({ message: 'Violation approved' });
});

app.post('/api/violations/:id/revoke', async (req, res) => {
  await Violation.findByIdAndUpdate(req.params.id, { status: 'Revoked' });
  res.json({ message: 'Violation revoked' });
});

const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}/index.html`);
  while (!open) await new Promise((r) => setTimeout(r, 100));
  await open(`http://localhost:${PORT}/index.html`);
});
