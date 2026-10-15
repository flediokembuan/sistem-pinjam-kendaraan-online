# 🏍️ MotoPinjam - Sistem Jasa Pinjam Kendaraan Online & GPS Tracker Real-Time

Sistem informasi dan pemesanan jasa rental kendaraan (motor) berbasis web modern yang dilengkapi fitur pelacakan GPS real-time interaktif, verifikasi identitas & jaminan peminjam (foto muka & KTP), kalkulasi durasi sewa, serta panel monitoring admin terpusat.

---

## 🌟 Fitur Utama Sistem

### 1. Portal Pelanggan (Customer Rental Portal)
- **Katalog Merek & Tipe Motor**:
  - Pilihan unit lengkap: *Honda Vario 160cc, Yamaha NMAX 155 Connected, Honda Beat Deluxe, Vespa Primavera 150, Kawasaki KLX 150 BF, Yamaha Aerox 155*.
  - Filter pencarian cepat berdasarkan merek motor (Honda, Yamaha, Vespa, Kawasaki).
  - Status ketersediaan unit (*Tersedia* / *Sedang Dipinjam*).
- **Kustomisasi Durasi Sewa (Berapa Hari)**:
  - Input jumlah hari sewa secara fleksibel (1 s/d 30 hari).
  - Otomatis menghitung tanggal selesai sewa dan estimasi pengembalian.
  - Perhitungan total biaya sewa dan deposit jaminan secara real-time.
- **Pemilihan Lokasi Penjemputan / Pengantaran**:
  - Tombol pilihan titik lokasi populer (Kampus UNKLAB, Kawasan Megamas, Bandara Sam Ratulangi, Pool Utama).
  - Peta interaktif (*Leaflet.js & OpenStreetMap*) untuk memilih titik koordinat tepat dengan menggeser pin lokasi.
- **Formulir Data Peminjam & Jaminan**:
  - Data diri lengkap: Nama sesuai KTP, NIK (16 digit), No. WhatsApp, Email, dan Alamat Domisili.
  - **Upload Foto Muka (Selfie)** peminjam dengan preview gambar instan.
  - **Upload Foto KTP Asli** peminjam dengan preview gambar instan.
  - Opsi dokumen jaminan fisik tambahan (KTM Mahasiswa, SIM A, NPWP, Paspor, atau Deposit Tunai).
- **Halaman Bukti & Tiket Pemesanan**:
  - Kode booking unik (contoh: `RNT-20261015-001`).
  - Ringkasan unit, durasi, total biaya, dan konfirmasi aktifnya sensor GPS pada kendaraan.

---

### 2. Panel Admin & Radar GPS Monitoring
- **Login Admin Aman**:
  - Otentikasi berbasis session.
  - Kredensial default:
    - **Username**: `admin`
    - **Password**: `admin123`
- **Dashboard Ringkasan Statistik**:
  - Total Unit Motor, Unit Sedang Dipinjam, GPS Terkoneksi Online, dan Total Pendapatan.
- **Peta GPS Interaktif (Live Radar Tracking)**:
  - Peta digital menampilkan seluruh posisi kendaraan yang terpasang alat pelacak GPS.
  - **Fitur Pemilih Kendaraan (Vehicle Selector)**:
    - Dropdown khusus untuk memilih kendaraan mana yang ingin dideteksi (*auto-pan*, *zoom in*, dan fokus ke unit yang dipilih).
  - **Telemetri Live Tiap Kendaraan**:
    - Status Mesin (*ON / OFF*).
    - Kecepatan kendaraan saat ini (*km/jam*).
    - Persentase baterai perangkat GPS tracker.
    - Waktu update terakhir & alamat jalan lokasi terdeteksi.
    - Data peminjam unit tersebut beserta tombol langsung ke WhatsApp peminjam.
  - **Tombol Simulasi GPS (Simulate Movement)**:
    - Mentransmisikan koordinat dinamis baru untuk mensimulasikan pergerakan motor di jalan raya.
- **Halaman Setiap Kendaraan yang Dipinjam & Data Jaminan**:
  - Tabel komprehensif seluruh peminjam aktif.
  - Tombol **"Lihat Foto Muka & KTP"**: Menampilkan modal pop-up HD verifikasi wajah dan KTP peminjam untuk memastikan keaslian dokumen.
  - Manajemen status sewa (*Berjalan*, *Selesai*, *Dibatalkan*). Jika status diubah menjadi *Selesai*, unit otomatis kembali *Tersedia*.

---

## 🛠️ Arsitektur & Teknologi

- **Backend**: Node.js & Express.js
- **Database Engine**: File-based Atomic JSON Database (`data/vehicles.json`, `data/rentals.json`) — ringan, tanpa instalasi database server tambahan, bebas galat kompilasi.
- **File Upload Handler**: Multer (`public/uploads/selfie` & `public/uploads/ktp`)
- **Peta & Geolocation**: Leaflet.js & OpenStreetMap Tiles
- **Frontend & UI**: HTML5, Tailwind CSS, FontAwesome 6, Vanilla JS Modern
- **Session & Auth**: Express-Session

---

## 🚀 Panduan Menjalankan Sistem Secara Lokal

### 1. Prasyarat
Pastikan komputer Anda sudah terinstall **Node.js** (v18+ direkomendasikan).

### 2. Instalasi Dependensi
Buka terminal pada folder proyek, lalu jalankan:
```bash
npm install
```

### 3. Jalankan Aplikasi
```bash
npm start
```

### 4. Akses Web
- **Halaman Pelanggan (Sewa Motor)**: [http://localhost:3000](http://localhost:3000)
- **Halaman Login Admin**: [http://localhost:3000/login](http://localhost:3000/login)
- **Kredensial Admin**:
  - Username: `admin`
  - Password: `admin123`

---

## 📤 Panduan Push ke Repositori GitHub Anda

Repositori Git lokal telah diinisialisasi dan siap di-push ke akun GitHub Anda:

```bash
# 1. Pastikan Anda sudah membuat repositori kosong di GitHub (misal: "sistem-rental-motor-online")
# 2. Hubungkan remote origin ke URL repositori Anda:
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git

# 3. Rename branch ke main (standar GitHub):
git branch -M main

# 4. Push seluruh kode ke GitHub:
git push -u origin main
```

---
*Dikembangkan untuk Tugas Praktikum Rekayasa Perangkat Lunak / SAD (System Analysis and Design).*
