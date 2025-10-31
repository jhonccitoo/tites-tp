// routes/users.js
const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  deleteUser
} = require('../controllers/user.controller');

// RUTA para CREAR un nuevo usuario
router.post('/', createUser);

// RUTA para OBTENER todos los usuarios
router.get('/', getUsers);

// RUTA para ELIMINAR un usuario
router.delete('/:id', deleteUser);

// RUTA específica: obtener solo secretarias
router.get('/secretarias', async (req, res) => {
  try {
    const User = require('../models/User');
    const secretarias = await User.find({ role: 'secretaria' });
    res.json(secretarias);
  } catch (err) {
    console.error('Error al obtener secretarias:', err);
    res.status(500).json({ message: 'Error al obtener secretarias' });
  }
});

module.exports = router;