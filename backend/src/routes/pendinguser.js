const express = require("express");
const router = express.Router();
const PendingUser = require("../models/PendingUser");
const User = require("../models/User");

// POST /api/pending-users
router.post("/", async (req, res) => {
  try {
    const nuevo = new PendingUser(req.body);
    await nuevo.save();
    res.status(201).json({ message: "Registro pendiente enviado a secretaría." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al registrar usuario." });
  }
});

// GET /api/pending-users
router.get("/", async (req, res) => {
  try {
    const pendientes = await PendingUser.find();
  	res.json(pendientes);
  } catch (error) {
  	res.status(500).json({ message: "Error al obtener pendientes." });
  }
});

router.put("/pago/:id", async (req, res) => {
  try {
  	const { pagoRealizado } = req.body;
   	const pending = await PendingUser.findByIdAndUpdate(
   	  req.params.id,
   	  { pagoRealizado },
   	  { new: true }
   	);
  	if (!pending)
  	  return res.status(404).json({ message: "Usuario no encontrado." });
  	res.json({ message: `Estado de pago actualizado a: ${pagoRealizado ? 'Pagó' : 'No pagó'}.`, pending });
  } catch (error) {
  	console.error(error);
  	res.status(500).json({ message: "Error al actualizar el estado de pago." });
  }
});

// PUT /api/users/pay/:id
router.put("/users/pay/:id", async (req, res) => {
   try {
   	const user = await User.findByIdAndUpdate(
   	  req.params.id,
   	  { pagado: true },
   	  { new: true }
   	);
   	res.json(user);
  } catch (err) {
   	res.status(500).json({ error: "Error actualizando estado de pago" });
  }
});

// POST /api/pending-users/approve/:id
router.post("/approve/:id", async (req, res) => {
   try {
   	const pending = await PendingUser.findById(req.params.id);
   	if (!pending) return res.status(404).json({ message: "No encontrado" }); 	
   	const user = new User({
   	  // Mapeo 1:1 (coinciden)
   	  nombre: pending.nombre,
   	  apellido: pending.apellido,
   	  correoInstitucional: pending.correoInstitucional,
   	  password: pending.password, 	  
   	  // Mapeo de campos con nombre diferente
   	  usuario: pending.usuario || pending.username, //Toma 'usuario' o 'username'
   	  pagoinscripcion: pending.pagoRealizado, // 'pagoRealizado' -> 'pagoinscripcion'
   	  // Asignación de rol
   	  rol: "tesista" // Tu código original decía "tesista", no "usuario"
 	});

   	await user.save();
   	await PendingUser.findByIdAndDelete(req.params.id);
   	res.json({ message: "Usuario validado y creado exitosamente." });
   } catch (error) {
   	console.error(error);
   	res.status(500).json({ message: "Error al aprobar usuario." });
  }
});

module.exports = router;