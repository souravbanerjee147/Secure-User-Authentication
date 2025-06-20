const express = require('express');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth.js');

const app = express();
const PORT = 5500;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 🔽 These are the critical middleware
app.use(express.json());                    
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
