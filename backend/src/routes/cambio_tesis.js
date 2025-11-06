
const express = require('express');
const router = express.Router();

const inbox = [];

function resolveStakeholders() {
  return {
    asesor: process.env.ASESOR_EMAIL || 'asesor',
    coordAcad: process.env.COORDINADOR_ACADEMICO_EMAIL || 'coord_acad',
    coordGral: process.env.COORDINADOR_GENERAL_EMAIL || 'coord_gral',
  };
}

/** Inserta un aviso en la “bandeja” */
function pushNotice(target, title, message, data = {}) {
  const item = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    target,              
    title,               
    message,              
    data,                 
    createdAt: new Date().toISOString(),
    read: false,
  };
  inbox.unshift(item);
  return item;
}

router.post('/broadcast', async (req, res) => {
  try {
    const {
      groupFolderId,
      groupName,
      tipo,
      tesisId,
      motivo,
      tesistaFullName,
    } = req.body || {};

    // Validación flexible: al menos uno (groupFolderId o tesisId) + tipo
    if ((!groupFolderId && !tesisId) || !tipo) {
      return res.status(400).json({ error: 'groupFolderId (o tesisId) y tipo son obligatorios' });
    }

    const fullName = (req.user && (req.user.fullName || req.user.name)) || tesistaFullName || 'Tesista';
    const { asesor, coordAcad, coordGral } = resolveStakeholders();

    const title = 'Solicitud de cambio en tesis';
    const isCambioTema = (tipo === 'cambio_tema');
    const msg = `El tesista ${fullName} ${groupName ? `del ${groupName} ` : ''}reporta: ${isCambioTema ? 'cambio de tema' : 'salida de compañero'}.`;

    const payload = {
      groupFolderId: groupFolderId || null,
      groupName: groupName || null,
      tesisId: tesisId || null,
      tipo,
      motivo: motivo || '',
      tesistaFullName: fullName,
    };

    // Notificar a los 3
    pushNotice(asesor,    title, msg, payload);
    pushNotice(coordAcad, title, msg, payload);
    pushNotice(coordGral, title, msg, payload);

    console.log('[CAMBIO_SOLICITADO]', payload);
    return res.json({ ok: true });
  } catch (e) {
    console.error('broadcast error:', e);
    return res.status(500).json({ error: 'No se pudo notificar' });
  }
});

/** GET /api/cambios/inbox?role=coord_acad */
router.get('/inbox', (req, res) => {
  const { role } = req.query;
  if (!role) return res.status(400).json({ error: 'role requerido' });
  const items = inbox.filter(n => n.target === role);
  res.json(items);
});

/** POST /api/cambios/inbox/read { ids: [] } */
router.post('/inbox/read', (req, res) => {
  const { ids = [] } = req.body || {};
  ids.forEach(id => {
    const n = inbox.find(x => x.id === id);
    if (n) n.read = true;
  });
  res.json({ ok: true });
});

module.exports = router;
