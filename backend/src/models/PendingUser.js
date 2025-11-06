const mongoose = require("mongoose"); 
const PendingUserSchema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  usuario: String,
  correoInstitucional: String,
  password: String,
  validado: { type: Boolean, default: false },
  pagoRealizado: { type: Boolean, default: false }
});

module.exports = mongoose.model("PendingUser", PendingUserSchema);