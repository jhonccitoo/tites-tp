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
// List only files that START WITH "F.TITES 007" in a folder
router.get('/coordinadoracademico/tesis007', authenticate, async (req, res) => {
  try {
    const targetFolder = req.query.folderId || process.env.DEFAULT_DRIVE_FOLDER_ID;
    if (!targetFolder) return res.status(400).json({ error: 'Falta folderId (o DEFAULT_DRIVE_FOLDER_ID)' });

    const { data } = await req.drive.files.list({
      q: `'${targetFolder}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder' and name contains 'F.TITES 007'`,
      fields: 'files(id,name,mimeType,modifiedTime,webViewLink)',
      orderBy: 'modifiedTime desc',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      pageSize: 1000,
    });

    const norm = s => (s||'').toUpperCase().replace(/\s+/g,' ').trim();
    const archivos = (data.files || []).filter(f => norm(f.name).startsWith('F.TITES 007'));

    res.json({ count: archivos.length, archivos });
  } catch (err) {
    console.error('F.TITES 007 list error:', err.message);
    res.status(500).json({ error: 'No se pudo listar F.TITES 007' });
  }
});
router.get('/coordinadoracademico/tesis007/:fileId/download', authenticate, async (req, res) => {
  try {
    const { fileId } = req.params;
    const meta = await req.drive.files.get({
      fileId,
      fields: 'name,mimeType',
      supportsAllDrives: true,
    });

    res.setHeader('Content-Disposition', `attachment; filename="${meta.data.name}"`);
    res.setHeader('Content-Type', meta.data.mimeType || 'application/pdf');

    const dl = await req.drive.files.get(
      { fileId, alt: 'media', supportsAllDrives: true },
      { responseType: 'stream' }
    );

    dl.data.on('error', e => {
      console.error('download error:', e.message);
      res.status(500).end();
    }).pipe(res);
  } catch (err) {
    console.error('download error:', err.message);
    res.status(500).json({ error: 'No se pudo descargar' });
  }
});

router.get('/coordinador-academico/debug-children', authenticate, async (req, res) => {
  try {
    const folderId = req.query.folderId || process.env.DRIVE_ROOT_STUDENTS_FOLDER_ID || process.env.DEFAULT_DRIVE_FOLDER_ID;
    if (!folderId) return res.status(400).json({ error: 'Provide ?folderId or set DRIVE_ROOT_STUDENTS_FOLDER_ID' });

    const { data } = await req.drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType)',
      orderBy: 'name',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      pageSize: 1000,
    });
    res.json(data.files || []);
  } catch (e) {
    console.error('debug-children error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/drive/coordinador-academico/tesis007/groups?rootId=<optional>&prefix=<optional>
router.get('/coordinador-academico/tesis007/groups', authenticate, async (req, res) => {
  try {
    const drive = req.drive;
    const rootId = req.query.rootId || process.env.DRIVE_ROOT_STUDENTS_FOLDER_ID || process.env.DEFAULT_DRIVE_FOLDER_ID;
    const prefixRaw = (req.query.prefix || 'F.TITES 007').trim();
    if (!rootId) return res.status(400).json({ error: 'Missing rootId/DRIVE_ROOT_STUDENTS_FOLDER_ID' });

    const norm = (s) => (s || '').toUpperCase().replace(/\s+/g, ' ').trim();
    const startsWithWanted = (name) => norm(name).startsWith(norm(prefixRaw));

    const listChildren = async (parentId, onlyFolders = false) => {
      const typeQ = onlyFolders
        ? "mimeType='application/vnd.google-apps.folder'"
        : "mimeType!='application/vnd.google-apps.folder'";
      const { data } = await drive.files.list({
        q: `'${parentId}' in parents and ${typeQ} and trashed=false`,
        fields: 'files(id,name,mimeType,modifiedTime,webViewLink,iconLink,size)',
        orderBy: 'name',
        includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        pageSize: 1000,
      });
      return data.files || [];
    };

    // 1) group folders directly under root
    const groups = await listChildren(rootId, true);

    // 2) for each group, list files in that folder (NO student subfolders)
    const results = [];
    for (const g of groups) {
      const files = await listChildren(g.id, false);
      const hits = files.filter(f => startsWithWanted(f.name));
      results.push({
        groupFolderId: g.id,
        groupName: g.name,
        files: hits, // may be empty
        groupWebLink: `https://drive.google.com/drive/folders/${g.id}`,
      });
    }

    res.json(results);
  } catch (err) {
    console.error('tesis007/groups error:', err.message);
    res.status(500).json({ error: 'Cannot list groups/files' });
  }
});
router.get('/oauth2callback', async (req, res) => {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`<pre>Google OAuth error: ${error}</pre>`);
  if (!code) return res.status(400).send('<pre>Missing ?code</pre>');
  try {
    const { tokens } = await oauth2Client.getToken(code);
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`
<!doctype html><html><body>
<script>
  (function () {
    const payload = {
      ok: true,
      source: 'tites-drive-oauth',
      tokens: { access_token: ${JSON.stringify(tokens.access_token || '')} }
    };
    if (window.opener && payload.tokens.access_token) {
      window.opener.postMessage(payload, window.location.origin.replace(':4000', ':5173'));
    }
    document.body.innerText = 'Google Drive connected. You can close this tab.';
    setTimeout(() => window.close(), 800);
  })();
</script>
</body></html>
    `);
  } catch (e) {
    console.error('OAuth exchange error:', e);
    res.status(500).send('<pre>Failed to exchange code for tokens.</pre>');
  }
});


module.exports = router;
