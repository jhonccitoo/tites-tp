const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth"); // Importa la ruta de autenticación
const notesRouter = require("./routes/notes"); // !!! IMPORTA EL ENRUTADOR DE NOTAS !!!
const driveRouter = require("./routes/drive");
const pendingUserRouter = require("./routes/pendinguser"); 
//const carpetasRoutes = require('./routes/carpetas'); //prueba carpetas

app.use("/api/users", usersRouter);
app.use("/api/auth", authRouter); // Usa el prefijo /api/auth para las rutas de autenticación
app.use("/api/notes", notesRouter); // !!! MONTA EL ENRUTADOR DE NOTAS EN LA RUTA /api/notes !!!
app.use("/api/drive", driveRouter);
app.use("/api/pending-users", pendingUserRouter);
//app.use('/api/carpetas', carpetasRoutes); //prueba carpetas

module.exports = app;
