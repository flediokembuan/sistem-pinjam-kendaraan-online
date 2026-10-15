const express = require('express');
const router = express.Router();

const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USER || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  name: 'Super Admin Rental',
  role: 'Administrator'
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan password wajib diisi!' });
  }

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.admin = {
      username: ADMIN_CREDENTIALS.username,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      loggedInAt: new Date().toISOString()
    };
    return res.json({
      success: true,
      message: 'Login Admin Berhasil!',
      user: req.session.admin
    });
  }

  return res.status(401).json({
    success: false,
    message: 'Username atau password salah! (Default: admin / admin123)'
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Gagal logout' });
    }
    res.clearCookie('connect.sid');
    return res.json({ success: true, message: 'Berhasil keluar' });
  });
});

router.get('/me', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ loggedIn: true, admin: req.session.admin });
  }
  return res.json({ loggedIn: false });
});

module.exports = router;
