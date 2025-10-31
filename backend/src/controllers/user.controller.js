// controllers/user.controller.js
const userCtrl = {};
const User = require("../models/User");

// Obtener todos los usuarios
userCtrl.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

// Crear usuario
userCtrl.createUser = async (req, res) => {
    console.log('createUser function called:', req.body);
    const { nombre, apellido, correoInstitucional, password, pagoInscripcion } = req.body;
    console.log('createUser function called:', req.body); 
    const { username, password, role } = req.body; // <-- también capturamos el role

    // Validaciones básicas
    if (!nombre || !apellido || !correoInstitucional || !password || typeof pagoInscripcion === 'undefined') {
        return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    // Validación nombre y apellido: solo letras y tildes
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

    // Todos los usuarios nuevos serán TESISTA
    const rol = "TESISTA";
    const newUser = new User({
        nombre,
        apellido,
        correoInstitucional,
        usuario: correoInstitucional,
        password,
        pagoInscripcion,
        rol
        username,
        password, // el middleware en el modelo lo hashea
        role: role || 'user', // si no viene rol, se asigna "user" por defecto
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
        console.error('Error creando usuario:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'El correo institucional ya está registrado.' });
        res.status(201).json({ message: 'User Created' });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Error al crear usuario.' });
    }
};

// Eliminar usuario
userCtrl.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json("User Deleted");
};

module.exports = userCtrl;