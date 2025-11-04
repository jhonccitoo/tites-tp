// backend/src/routes/revisorRoutes.js
const express = require("express");
const router = express.Router();
const revisorController = require("../controllers/revisorController"); // asegúrate que el archivo se llame exactamente así

// Obtener grupos disponibles para Revisor1
router.get("/grupos/revisor1", revisorController.getGruposRevisor1);

// Obtener grupos disponibles para Revisor2
router.get("/grupos/revisor2", revisorController.getGruposRevisor2);

// Obtener grupo por ID (para modal con estado actualizado)
router.get("/grupo/:id", revisorController.getGrupoPorId);

// Marcar check (check1 o check2 según revisor)
router.patch("/check/:id", revisorController.marcarCheck);

module.exports = router;
