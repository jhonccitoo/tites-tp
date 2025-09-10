// Ejemplo en routes/auth.js (o donde definas la ruta de login)
const router = require('express').Router();
const User = require('../models/User'); // Ajusta la ruta
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // Si usas JWT

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // 1. Buscar al usuario por username
        const user = await User.findOne({ username: username });
        if (!user) {
            // ¡Importante! No digas "Usuario no encontrado". Usa un mensaje genérico.
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            // ¡Importante! Mensaje genérico también aquí.
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // --- Autenticación Exitosa ---

        // 3. Generar Respuesta (Ejemplo con JWT)
        const payload = {
            userId: user._id,
            username: user.username
            // Puedes añadir más datos no sensibles si quieres (ej: roles)
        };

        const jwtSecret = process.env.JWT_SECRET || 'TU_CLAVE_SECRETA_MUY_SEGURA'; // ¡CAMBIAR ESTO!

        const token = jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: '1h' } // Tiempo de expiración del token (ej: 1 hora)
        );

        // Envía el token y, opcionalmente, algunos datos del usuario (sin la contraseña)
        res.json({
            message: 'Login successful!',
            token: token,
            user: { // Devuelve datos seguros del usuario si el frontend los necesita
                id: user._id,
                username: user.username,
            }
        });

    } catch (error) {
        console.error("Login server error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router; // Exporta el router