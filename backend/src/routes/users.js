const express = require('express');
const router = express.Router();
const { getUsers, createUser, deleteUser } = require('../controllers/user.controller'); // Importa tu controlador de usuario

// Ruta para CREAR un nuevo usuario
router.post('/', createUser); // Llama a la función createUser de tu controlador

// Ruta para OBTENER todos los usuarios
router.get('/', getUsers); // Llama a la función getUsers de tu controlador

router.delete('/:id', deleteUser); 

module.exports = router;