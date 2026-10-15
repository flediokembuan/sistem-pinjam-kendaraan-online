const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const apiRouter = require('./src/routes/api');
const authRouter = require('./src/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session for Admin Authentication
app.use(session({
  secret: 'rental-motor-online-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Static files (public)
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', apiRouter);
app.use('/api/auth', authRouter);

// Fallback route for user convenience
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Sistem Jasa Pinjam Kendaraan Online Berjalan!`);
  console.log(`📍 URL Customer : http://localhost:${PORT}`);
  console.log(`🛡️  URL Admin    : http://localhost:${PORT}/login`);
  console.log(`🔑 Admin Login  : username: admin | password: admin123`);
  console.log(`====================================================`);
});
