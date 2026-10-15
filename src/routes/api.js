const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Ensure upload folders exist
const selfieDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'selfie');
const ktpDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'ktp');
[selfieDir, ktpDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'selfiePhoto') {
      cb(null, selfieDir);
    } else if (file.fieldname === 'ktpPhoto') {
      cb(null, ktpDir);
    } else {
      cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
    }
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan!'));
    }
  }
});

// Admin Auth Middleware
function requireAdmin(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Akses ditolak. Silakan login sebagai Admin.' });
}

// ==================== VEHICLES ENDPOINTS ====================

// Get all vehicles
router.get('/vehicles', (req, res) => {
  const { status, brand } = req.query;
  let list = db.getVehicles();
  if (status) {
    list = list.filter(v => v.status.toLowerCase() === status.toLowerCase());
  }
  if (brand) {
    list = list.filter(v => v.brand.toLowerCase() === brand.toLowerCase());
  }
  res.json({ success: true, count: list.length, data: list });
});

// Get vehicle by id
router.get('/vehicles/:id', (req, res) => {
  const vehicle = db.getVehicleById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });
  }
  res.json({ success: true, data: vehicle });
});

// Simulate GPS movement (untuk demo pendeteksi lokasi kendaraan)
router.post('/vehicles/:id/simulate-move', (req, res) => {
  const vehicle = db.getVehicleById(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ success: false, message: 'Kendaraan tidak ditemukan' });
  }

  // Small random delta to simulate moving vehicle (~100-300m)
  const deltaLat = (Math.random() - 0.5) * 0.003;
  const deltaLng = (Math.random() - 0.5) * 0.003;
  const currentSpeed = Math.floor(20 + Math.random() * 40);

  const updatedGPS = {
    lat: Number((vehicle.gps.lat + deltaLat).toFixed(6)),
    lng: Number((vehicle.gps.lng + deltaLng).toFixed(6)),
    speed: currentSpeed,
    engineStatus: 'ON',
    battery: `${Math.max(50, parseInt(vehicle.gps.battery || 85) - (Math.random() > 0.8 ? 1 : 0))}%`
  };

  const updatedVehicle = db.updateVehicleGPS(req.params.id, updatedGPS);
  res.json({
    success: true,
    message: `Koordinat GPS ${vehicle.name} (${vehicle.plateNumber}) berhasil diperbarui`,
    gps: updatedVehicle.gps
  });
});

// ==================== RENTALS ENDPOINTS ====================

// Get all rentals (Admin view)
router.get('/rentals', (req, res) => {
  const { status } = req.query;
  let list = db.getRentals();
  if (status) {
    list = list.filter(r => r.rental.rentalStatus.toLowerCase() === status.toLowerCase());
  }
  res.json({ success: true, count: list.length, data: list });
});

// Get rental by ID
router.get('/rentals/:id', (req, res) => {
  const rental = db.getRentalById(req.params.id);
  if (!rental) {
    return res.status(404).json({ success: false, message: 'Data pinjaman tidak ditemukan' });
  }
  res.json({ success: true, data: rental });
});

// Create new Rental (Customer booking)
router.post('/rentals', upload.fields([
  { name: 'selfiePhoto', maxCount: 1 },
  { name: 'ktpPhoto', maxCount: 1 }
]), (req, res) => {
  try {
    const {
      vehicleId,
      fullName,
      nik,
      phone,
      email,
      address,
      guaranteeType,
      guaranteeNote,
      durationDays,
      startDate,
      pickupLocation,
      pickupLat,
      pickupLng
    } = req.body;

    if (!vehicleId || !fullName || !nik || !phone || !durationDays || !startDate || !pickupLocation) {
      return res.status(400).json({
        success: false,
        message: 'Lengkapi semua field wajib: motor, nama lengkap, NIK, No HP, durasi pinjam, tanggal, dan lokasi!'
      });
    }

    const vehicle = db.getVehicleById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Kendaraan yang dipilih tidak valid!' });
    }

    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days < 1) {
      return res.status(400).json({ success: false, message: 'Durasi hari pinjaman minimal 1 hari!' });
    }

    // Calculate dates
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days);

    const totalCost = vehicle.dailyRate * days;
    const deposit = 100000; // Standard deposit

    // Check files
    let selfiePath = '/uploads/selfie/sample-selfie1.jpg';
    let ktpPath = '/uploads/ktp/sample-ktp1.jpg';

    if (req.files && req.files['selfiePhoto'] && req.files['selfiePhoto'][0]) {
      selfiePath = `/uploads/selfie/${req.files['selfiePhoto'][0].filename}`;
    }
    if (req.files && req.files['ktpPhoto'] && req.files['ktpPhoto'][0]) {
      ktpPath = `/uploads/ktp/${req.files['ktpPhoto'][0].filename}`;
    }

    const newRentalPayload = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      vehiclePlate: vehicle.plateNumber,
      borrower: {
        fullName,
        nik,
        phone,
        email: email || '-',
        address,
        selfiePhoto: selfiePath,
        ktpPhoto: ktpPath,
        guaranteeType: guaranteeType || 'KTP Asli',
        guaranteeNote: guaranteeNote || 'Dokumen jaminan diserahkan saat serah terima unit'
      },
      rental: {
        durationDays: days,
        startDate: startDate,
        endDate: end.toISOString().split('T')[0],
        pickupLocation,
        pickupLat: parseFloat(pickupLat) || 1.4170,
        pickupLng: parseFloat(pickupLng) || 124.9829,
        dailyRate: vehicle.dailyRate,
        totalCost,
        deposit,
        paymentStatus: 'MENUNGGU VERIFIKASI',
        rentalStatus: 'Berjalan',
        bookedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
      }
    };

    const created = db.createRental(newRentalPayload);

    // Also update GPS location to match pickup location
    if (pickupLat && pickupLng) {
      db.updateVehicleGPS(vehicleId, {
        lat: parseFloat(pickupLat),
        lng: parseFloat(pickupLng),
        address: pickupLocation,
        engineStatus: 'ON',
        speed: 0
      });
    }

    res.status(201).json({
      success: true,
      message: 'Pengajuan sewa kendaraan berhasil dikirim!',
      rentalId: created.id,
      data: created
    });
  } catch (error) {
    console.error('Error creating rental:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem: ' + error.message });
  }
});

// Update rental status (Admin action)
router.patch('/rentals/:id/status', (req, res) => {
  const { rentalStatus } = req.body;
  if (!rentalStatus) {
    return res.status(400).json({ success: false, message: 'Status rental harus disertakan' });
  }

  const updated = db.updateRentalStatus(req.params.id, rentalStatus);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Pinjaman tidak ditemukan' });
  }

  res.json({
    success: true,
    message: `Status pinjaman berhasil diubah menjadi "${rentalStatus}"`,
    data: updated
  });
});

// Dashboard stats summary
router.get('/stats', (req, res) => {
  const vehicles = db.getVehicles();
  const rentals = db.getRentals();

  const totalVehicles = vehicles.length;
  const rentedVehicles = vehicles.filter(v => v.status === 'dipinjam').length;
  const availableVehicles = vehicles.filter(v => v.status === 'tersedia').length;
  const activeRentals = rentals.filter(r => r.rental.rentalStatus === 'Berjalan').length;
  const totalRevenue = rentals.reduce((acc, curr) => acc + (curr.rental.totalCost || 0), 0);

  res.json({
    success: true,
    stats: {
      totalVehicles,
      rentedVehicles,
      availableVehicles,
      activeRentals,
      totalRevenue
    }
  });
});

module.exports = router;
