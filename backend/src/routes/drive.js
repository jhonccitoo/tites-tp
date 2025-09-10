const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const router = express.Router();

// === Configuración OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const FORMULARIOS_FOLDER_ID = '17O5a0TyBYK_0C2GG1ljt8DpTVnEMb-KF'; // ID corregido

const client = new MongoClient(process.env.ATLAS_URI);
const dbName = 'TITESTP';

// === Auth URL
router.get('/auth-url', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.send({ url });
});

// === Obtener tokens desde código
router.post('/auth', async (req, res) => {
  const { code } = req.body;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    res.send(tokens);
  } catch (error) {
    console.error('Error al intercambiar código:', error);
    res.status(500).send({ error: 'Error intercambiando código' });
  }
});

// === Middleware de autenticación
function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token faltante' });

  const authClient = new google.auth.OAuth2();
  authClient.setCredentials({ access_token: token });

  const drive = google.drive({ version: 'v3', auth: authClient });

  drive.about.get({ fields: 'user' }, (err) => {
    if (err) {
      console.error('Token inválido:', err.message);
      return res.status(403).json({ error: 'Token inválido', details: err.message });
    }
    req.drive = drive;
    next();
  });
}

// === Listar archivos en carpeta
router.get('/files', authenticate, async (req, res) => {
  const folderId = req.query.folderId;
  if (!folderId) return res.status(400).json({ error: 'Falta folderId' });

  try {
    const response = await req.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      spaces: 'drive',
    });
    res.json(response.data.files);
  } catch (err) {
    console.error('Error listando archivos:', err.message);
    res.status(500).json({ error: 'Error al listar archivos', details: err.message });
  }
});

// === Subir archivo
const upload = multer({ dest: 'uploads/' });
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const folderId = req.query.folderId;
    const fileMetadata = {
      name: req.file.originalname,
      ...(folderId && { parents: [folderId] }),
    };
    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(req.file.path),
    };

    const response = await req.drive.files.create({
      resource: fileMetadata,
      media,
      fields: 'id',
      supportsAllDrives: true,
    });

    fs.unlinkSync(req.file.path);
    res.json({ fileId: response.data.id });
  } catch (err) {
    console.error('Error subiendo archivo:', err);
    res.status(500).json({ error: 'Error al subir archivo' });
  }
});

// === Duplicar archivo
router.post('/duplicar-archivo', authenticate, async (req, res) => {
  const { fileId, carpetaDestinoId, nombre } = req.body;

  if (!fileId || !carpetaDestinoId || !nombre) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const copia = await req.drive.files.copy({
      fileId,
      supportsAllDrives: true,
      requestBody: {
        name: nombre,
        parents: [carpetaDestinoId],
      },
    });

    res.status(200).json({ nuevoArchivoId: copia.data.id });
  } catch (error) {
    console.error('Error duplicando archivo:', error.message);
    res.status(500).json({ error: 'Error duplicando archivo', details: error.message });
  }
});

// === Listar formularios (usando misma lógica que /files)
router.get('/formularios', authenticate, async (req, res) => {
  try {
    //console.log("Intentando acceder a la carpeta TITES - FORMULARIOS con ID:", FORMULARIOS_FOLDER_ID);

    const response = await req.drive.files.list({
      q: `'${FORMULARIOS_FOLDER_ID}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      spaces: 'drive',
    });

    const archivos = response.data.files;

    //console.log(`Se encontraron ${archivos.length} formularios.`);
    //archivos.forEach((file, i) =>
    //  console.log(`[${i + 1}] ${file.name} (${file.mimeType}) - ID: ${file.id}`)
    //);

    res.json(archivos);
  } catch (err) {
    console.error('Error listando formularios:', err.message);
    if (err.response?.data) console.error('Detalles:', JSON.stringify(err.response.data));
    res.status(500).json({ error: 'Error al listar formularios', details: err.message });
  }
});

// === Obtener carpetas asignadas a asesor
router.get('/asesor/:id', async (req, res) => {
  const asesorId = req.params.id;

  try {
    await client.connect();
    const db = client.db(dbName);
    const carpetas = db.collection('carpetas');
    const grupos = await carpetas.find({ asesor_id: asesorId }).toArray();
    res.json(grupos);
  } catch (error) {
    console.error('Error obteniendo carpetas:', error);
    res.status(500).json({ error: 'No se pudieron obtener las carpetas' });
  }
});

module.exports = router;
