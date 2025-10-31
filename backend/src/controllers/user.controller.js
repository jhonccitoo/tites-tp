// controllers/user.controller.js
const userCtrl = {};
const User = require("../models/User");

// --- Obtener todos los usuarios ---
userCtrl.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios.' });
    }
};

// --- Crear un nuevo usuario (TESISTA) ---
userCtrl.createUser = async (req, res) => {
    console.log('createUser function called:', req.body);
    
    // 1. Destructuración de los campos esperados para un TESISTA
    const { nombre, apellido, correoInstitucional, password, pagoInscripcion } = req.body;

    // 2. Validaciones (Esta parte estaba mayormente bien)
    // Validación de campos requeridos
    if (!nombre || !apellido || !correoInstitucional || !password || typeof pagoInscripcion === 'undefined') {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Validación de nombre y apellido: solo letras y tildes
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;
    if (!regexNombre.test(nombre)) {
        return res.status(400).json({ message: 'El nombre solo puede contener letras y tildes.' });
    }
    if (!regexNombre.test(apellido)) {
        return res.status(400).json({ message: 'El apellido solo puede contener letras y tildes.' });
    }

    // Validación de correo institucional: solo @urp.edu.pe
    const urpRegex = /^[^@\s]+@urp\.edu\.pe$/i;
    if (!urpRegex.test(correoInstitucional)) {
        return res.status(400).json({ message: 'El correo debe ser @urp.edu.pe.' });
    }

    // 3. Creación del objeto de nuevo usuario (Corregido)
    const rol = "TESISTA"; // Todos los usuarios nuevos serán TESISTA
    
    const newUser = new User({
        nombre,
        apellido,
        correoInstitucional,
        usuario: correoInstitucional, // Se asume que el 'usuario' es el mismo correo
        password, // El middleware en el modelo (pre-save) debería hashearlo
        pagoInscripcion,
        rol 
        // Se eliminaron los campos duplicados y conflictivos (username, role)
    });

    // 4. Guardar en la BD y manejo de errores (Corregido)
    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    
    } catch (error) {
        console.error('Error creando usuario:', error);
        
        // Error de clave duplicada (ej. correo ya registrado)
        if (error.code === 11000) {
            // Identifica qué campo fue el duplicado
            if (error.keyPattern && error.keyPattern.correoInstitucional) {
                return res.status(400).json({ message: 'El correo institucional ya está registrado.' });
            }
            return res.status(400).json({ message: 'El usuario o correo ya existe.' });
        }
        
        // Cualquier otro error del servidor
        res.status(500).json({ message: 'Error interno al crear el usuario.' });
    }
};

// --- Eliminar usuario ---
userCtrl.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }
        res.status(200).json({ message: "Usuario eliminado exitosamente." });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ message: 'Error al eliminar el usuario.' });
a     }
};

module.exports = userCtrl;
