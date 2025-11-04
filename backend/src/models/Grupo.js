const mongoose = require("mongoose");

const grupoSchema = new mongoose.Schema({
  grupo: String,
  carpeta_grupo_id: String,
  carpeta_final_id: String,
  tesistas: Array,
  asesor_id: String,
  estado: String,
  check1: Boolean,
  check2: Boolean,
});

module.exports = mongoose.model("Grupo", grupoSchema, "carpetas");
