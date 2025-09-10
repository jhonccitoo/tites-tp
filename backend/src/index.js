// src/index.js (Contenido RECOMENDADO)
const app = require('./app'); // Importa la app configurada desde app.js
require('dotenv').config(); // Carga las variables de entorno aquí también si es necesario
require('./database'); // Llama al archivo que conecta la BD (si tienes uno separado como database.js)

async function main() {
    // Obtén el puerto de las variables de entorno o usa 4000 por defecto
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Server is running on port: ${port}`);
}

main().catch(err => console.error("Error starting server:", err)); // Llama a la función main y maneja errores