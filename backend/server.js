const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.js');

const app = express();
const PORT = 5500;

app.use(express.static(path.join(__dirname, '..')));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));




// These are the critical middleware
app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/api', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
