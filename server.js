const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
// const open = require('open'); // <-- add this line
const open = require('open').default || require('open');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const violationsDB = [];
let nextId = 1;

app.post('/api/violations', (req, res) => {
  const violation = req.body;
  violation.id = nextId++;
  violation.status = 'Pending';
  violation.timestamp = new Date().toISOString();
  violationsDB.push(violation);
  res.json({ message: 'Violation submitted for approval', id: violation.id });
});

app.get('/api/violations', (req, res) => {
  res.json(violationsDB);
});

app.post('/api/violations/:id/approve', (req, res) => {
  const id = parseInt(req.params.id);
  const violation = violationsDB.find(v => v.id === id);
  if (violation && violation.status === 'Pending') {
    violation.status = 'Approved';
    res.json({ message: 'Violation approved' });
  } else {
    res.status(404).json({ message: 'Violation not found or not pending' });
  }
});

app.post('/api/violations/:id/revoke', (req, res) => {
  const id = parseInt(req.params.id);
  const violation = violationsDB.find(v => v.id === id);
  if (violation && (violation.status === 'Pending' || violation.status === 'Approved')) {
    violation.status = 'Revoked';
    res.json({ message: 'Violation revoked' });
  } else {
    res.status(404).json({ message: 'Violation not found or invalid status' });
  }
});

// When server starts, automatically open the frontend in your default browser
const PORT = 3000;
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await open(`http://localhost:${PORT}/faculty.html`);
});
