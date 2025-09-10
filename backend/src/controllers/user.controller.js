const userCtrl = {};

const User = require("../models/User");

userCtrl.getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};

userCtrl.createUser = async (req, res) => {
    console.log('createUser function called:', req.body); 
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const newUser = new User({
        username: username,
        password: password, // ¡Ahora guardamos la contraseña en texto plano aquí!
    });

    try {
        await newUser.save(); // El middleware 'pre('save')' en el modelo la hasheará antes de guardar
        res.status(201).json({ message: 'User Created' });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) { // Error de llave duplicada (username único)
            return res.status(400).json({ message: 'Username already exists' });
        }
        res.status(500).json({ message: 'Error creating user' });
    }
};

userCtrl.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json("User Deleted");
};

module.exports = userCtrl;