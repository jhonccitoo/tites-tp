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
    const { username, password, role } = req.body; // <-- también capturamos el role

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const newUser = new User({
        username,
        password, // el middleware en el modelo lo hashea
        role: role || 'user', // si no viene rol, se asigna "user" por defecto
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User Created' });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Eliminar usuario
userCtrl.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json("User Deleted");
};

module.exports = userCtrl;