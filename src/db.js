const fs = require('fs');
const path = require('path');

const VEHICLES_FILE = path.join(__dirname, '..', 'data', 'vehicles.json');
const RENTALS_FILE = path.join(__dirname, '..', 'data', 'rentals.json');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readData(file, defaultVal = []) {
  try {
    if (!fs.existsSync(file)) {
      writeData(file, defaultVal);
      return defaultVal;
    }
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return defaultVal;
  }
}

function writeData(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

const db = {
  // VEHICLES
  getVehicles() {
    return readData(VEHICLES_FILE);
  },

  getVehicleById(id) {
    const list = this.getVehicles();
    return list.find(v => v.id === id);
  },

  updateVehicle(id, updates) {
    const list = this.getVehicles();
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      writeData(VEHICLES_FILE, list);
      return list[index];
    }
    return null;
  },

  updateVehicleGPS(id, gpsData) {
    const list = this.getVehicles();
    const index = list.findIndex(v => v.id === id);
    if (index !== -1) {
      list[index].gps = {
        ...list[index].gps,
        ...gpsData,
        lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      writeData(VEHICLES_FILE, list);
      return list[index];
    }
    return null;
  },

  // RENTALS
  getRentals() {
    return readData(RENTALS_FILE);
  },

  getRentalById(id) {
    const list = this.getRentals();
    return list.find(r => r.id === id);
  },

  createRental(rentalPayload) {
    const list = this.getRentals();
    const id = `RNT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(list.length + 1).padStart(3, '0')}`;
    
    const newRental = {
      id,
      ...rentalPayload,
      createdAt: new Date().toISOString()
    };

    list.unshift(newRental);
    writeData(RENTALS_FILE, list);

    // Update vehicle status to dipinjam
    if (rentalPayload.vehicleId) {
      this.updateVehicle(rentalPayload.vehicleId, { status: 'dipinjam' });
    }

    return newRental;
  },

  updateRentalStatus(id, rentalStatus) {
    const list = this.getRentals();
    const item = list.find(r => r.id === id);
    if (item) {
      item.rental.rentalStatus = rentalStatus;
      writeData(RENTALS_FILE, list);

      if (rentalStatus === 'Selesai' || rentalStatus === 'Dibatalkan') {
        this.updateVehicle(item.vehicleId, { status: 'tersedia' });
      } else if (rentalStatus === 'Berjalan') {
        this.updateVehicle(item.vehicleId, { status: 'dipinjam' });
      }
      return item;
    }
    return null;
  }
};

module.exports = db;
