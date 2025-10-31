// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { Schema } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Asegura que los nombres de usuario sean únicos
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["usuario", "admin", "coordinador", "secretaria"], // posibles roles
        default: "usuario"
    },
    // Otros campos opcionales:
    email: {
        type: String,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Middleware PRE-SAVE para hashear la contraseña ANTES de guardarla
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método para comparar contraseñas (útil para login)
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema, 'users');