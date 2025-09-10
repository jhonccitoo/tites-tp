// src/database.js
const mongoose = require('mongoose');
require('dotenv').config(); // Carga .env si es necesario aquí

const uri = process.env.ATLAS_URI;

mongoose.connect(uri)
  .then(() => console.log('Database connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// No necesitas exportar nada si solo quieres ejecutar la conexión.