const Grupo = require("../models/Grupo");

// ── Obtener grupos disponibles para Revisor1
exports.getGruposRevisor1 = async (req, res) => {
  try {
    const grupos = await Grupo.find({ estado: { $ne: "REVISADO" } });

    const gruposFiltrados = grupos
      .map((g) => {
        const numero = parseInt(g.grupo.match(/\d+/)?.[0] || 0);
        const grupoBase = numero >= 1 && numero <= 5 && !g.check1;
        const grupoExtra = numero >= 6 && numero <= 10 && g.check2 && !g.check1;

        if (!grupoBase && !grupoExtra) return null;

        // Usar 'estado' directamente
        const estadoActual = g.check1 && g.check2
          ? "REVISADO"
          : g.check1 || g.check2
            ? "EN REVISIÓN"
            : "PENDIENTE";

        return {
          _id: g._id,
          nombreArchivo: g.grupo,
          carpeta_grupo_id: g.carpeta_grupo_id,
          estado: estadoActual,
          check1: g.check1,
          check2: g.check2,
        };
      })
      .filter(Boolean);

    res.json(gruposFiltrados);
  } catch (error) {
    console.error("Error en getGruposRevisor1:", error);
    res.status(500).json({ message: "Error al obtener grupos para Revisor1" });
  }
};

// ── Obtener grupos disponibles para Revisor2
exports.getGruposRevisor2 = async (req, res) => {
  try {
    const grupos = await Grupo.find({ estado: { $ne: "REVISADO" } });

    const gruposFiltrados = grupos
      .map((g) => {
        const numero = parseInt(g.grupo.match(/\d+/)?.[0] || 0);
        const grupoBase = numero >= 6 && numero <= 10 && !g.check2;
        const grupoExtra = numero >= 1 && numero <= 5 && g.check1 && !g.check2;

        if (!grupoBase && !grupoExtra) return null;

        const estadoActual = g.check1 && g.check2
          ? "REVISADO"
          : g.check1 || g.check2
            ? "EN REVISIÓN"
            : "PENDIENTE";

        return {
          _id: g._id,
          nombreArchivo: g.grupo,
          carpeta_grupo_id: g.carpeta_grupo_id,
          estado: estadoActual,
          check1: g.check1,
          check2: g.check2,
        };
      })
      .filter(Boolean);

    res.json(gruposFiltrados);
  } catch (error) {
    console.error("Error en getGruposRevisor2:", error);
    res.status(500).json({ message: "Error al obtener grupos para Revisor2" });
  }
};

// ── Obtener grupo por ID (para modal con estado actualizado)
exports.getGrupoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const grupo = await Grupo.findById(id);
    if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });

    const estadoActual = grupo.check1 && grupo.check2
      ? "REVISADO"
      : grupo.check1 || grupo.check2
        ? "EN REVISIÓN"
        : "PENDIENTE";

    res.json({
      _id: grupo._id,
      nombreArchivo: grupo.grupo,
      carpeta_grupo_id: grupo.carpeta_grupo_id,
      estado: estadoActual,
      check1: grupo.check1,
      check2: grupo.check2,
    });
  } catch (error) {
    console.error("Error en getGrupoPorId:", error);
    res.status(500).json({ message: "Error al obtener el grupo" });
  }
};

// ── Marcar check y actualizar estado dinámicamente
exports.marcarCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const { revisor } = req.body;

    const grupo = await Grupo.findById(id);
    if (!grupo) return res.status(404).json({ message: "Grupo no encontrado" });

    // Actualizar check según el revisor
    if (revisor === "Revisor1") grupo.check1 = true;
    if (revisor === "Revisor2") grupo.check2 = true;

    // Actualizar estado
    if (grupo.check1 && grupo.check2) {
      grupo.estado = "REVISADO";
    } else if (grupo.check1 || grupo.check2) {
      grupo.estado = "EN REVISIÓN";
    } else {
      grupo.estado = "PENDIENTE";
    }

    await grupo.save();

    res.json({
      message: "Check y estado actualizados correctamente",
      grupo: {
        _id: grupo._id,
        nombreArchivo: grupo.grupo,
        carpeta_grupo_id: grupo.carpeta_grupo_id,
        estado: grupo.estado,
        check1: grupo.check1,
        check2: grupo.check2,
      },
    });
  } catch (error) {
    console.error("Error en marcarCheck:", error);
    res.status(500).json({ message: "Error al actualizar el check y el estado" });
  }
};
