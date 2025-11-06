import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  InputGroup,
  Badge,
  Dropdown,
  Spinner,
  Modal, // Importamos Modal para el 'Ver Estado'
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// Icono para representar un archivo genérico (Copiado de TesistaView)
const fileIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    className="bi bi-file-earmark-text me-2"
    viewBox="0 0 16 16"
  >
    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" />
    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" />
  </svg>
);

function CoordinadorAcademicoView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [tesis, setTesis] = useState([]);

  // --- NUEVOS ESTADOS DEL TESISTA VIEW ---
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  // ----------------------------------------

  const fileInputRef = useRef(null);
  const pendingUploadRef = useRef({ folderId: null, rowId: null });

  const token = localStorage.getItem("googleToken");

  // Load Drive data from backend on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (!token) return;
        setLoading(true);

        // *** CAMBIO CLAVE: Usamos un endpoint que trae TODOS los F.TITES de TODOS los grupos ***
        // Asumiendo que este endpoint devuelve: [{ groupName, groupFolderId, groupWebLink, files: [{ id, name, modifiedTime, webViewLink, mimeType }] }]
        const r = await fetch("/api/drive/coordinador-academico/all-files", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();

        const rows = [];
        (data || []).forEach((group) => {
          // Filtramos solo archivos cuyo nombre contiene 'F.TITES'
          const fTitesFiles = (group.files || []).filter((f) =>
            f.name.includes("F.TITES")
          );

          if (fTitesFiles.length) {
            fTitesFiles.forEach((f) => {
              const dt = f.modifiedTime ? new Date(f.modifiedTime) : null;
              rows.push({
                // Generamos un ID único que incluya el nombre del archivo, pues el ID de Drive es el mismo si es un archivo
                id: f.id + f.name,
                driveFileId: f.id, // Guardamos el ID real de Drive
                nombre: group.groupName,
                rol: "Tesista",
                fecha: dt ? dt.toISOString().slice(0, 10) : "",
                hora: dt ? dt.toTimeString().slice(0, 5) : "",
                driveUrl: f.webViewLink,
                estado: "pendiente", // El estado ahora aplica al archivo
                comentarios: "",
                ultima: dt ? dt.toISOString().slice(0, 10) : "",
                fileName: f.name
                  .replace(/^Copia de /i, "")
                  .replace(/\.docx$/i, ""), // Limpiamos el nombre
                groupFolderId: group.groupFolderId,
                groupWebLink: group.groupWebLink,
                mimeType: f.mimeType,
                // Identificador para el tipo de formulario
                formType: f.name.match(/F\.TITES\s\d+/i)?.[0] || "F.TITES",
              });
            });
          }
        });

        setTesis(rows);
      } catch (e) {
        console.error("Drive files fetch failed:", e);
        setTesis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [token]);

  // Search + filter
  const filtered = useMemo(() => {
    return tesis.filter((t) => {
      const bySearch =
        !searchTerm ||
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.fileName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const byStatus = statusFilter === "todos" || t.estado === statusFilter;
      return bySearch && byStatus;
    });
  }, [tesis, searchTerm, statusFilter]);

  const badgeEstado = (estado) => {
    if (estado === "pendiente")
      return (
        <Badge bg="warning" text="dark">
          PENDIENTE
        </Badge>
      );
    if (estado === "aprobado") return <Badge bg="success">APROBADO</Badge>;
    return <Badge bg="danger">DESAPROBADO</Badge>;
  };

  const setEstado = (id, nuevo) => {
    setTesis((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: nuevo } : t))
    );
    // Opcional: Cerrar modal si se actualiza el estado desde los botones de la tarjeta
    if (archivoSeleccionado && archivoSeleccionado.id === id) {
      setArchivoSeleccionado((prev) => ({ ...prev, estado: nuevo }));
    }
  };

  const setComentario = (id, value) => {
    setTesis((prev) =>
      prev.map((t) => (t.id === id ? { ...t, comentarios: value } : t))
    );
  };

  // Función para abrir el modal con el estado (copiado de TesistaView)
  const openEstadoModal = (fileData) => {
    // Usamos los datos actuales de la fila (t) para simular el estado
    setArchivoSeleccionado({
      id: fileData.id,
      name: fileData.fileName,
      estado: fileData.estado[0].toUpperCase() + fileData.estado.slice(1), // Capitalizar
      comentarios: fileData.comentarios || "Sin comentarios del coordinador.",
      // Añadir el driveFileId para el botón de 'Abrir'
      driveFileId: fileData.driveFileId,
    });
    setShowEstadoModal(true);
  };

  // Download via backend stream
  const descargar = async (fileId, suggestedName) => {
    try {
      const token = localStorage.getItem("googleToken");
      const res = await fetch(
        `/api/drive/coordinador-academico/file/${fileId}/download`, // Modificado para un archivo general
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${suggestedName}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error("Descarga falló:", e);
      alert("No se pudo descargar el archivo.");
    }
  };

  // Open file picker to upload F7 (se mantiene solo por si se usa para subir correcciones)
  const abrirSelector = (row) => {
    pendingUploadRef.current = { folderId: row.groupFolderId, rowId: row.id };
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  const onFilePicked = async (e) => {
    // ... Lógica de subida de archivos (se mantiene igual, asumiendo que es para subir un F7 o corrección) ...
    const file = e.target.files?.[0];
    const { folderId } = pendingUploadRef.current || {};
    if (!file || !folderId) return;
    try {
      const token = localStorage.getItem("googleToken");
      const form = new FormData();
      form.append("file", file);

      const r = await fetch(
        `/api/drive/upload?folderId=${encodeURIComponent(folderId)}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );
      if (!r.ok) throw new Error("Upload failed");
      await r.json();
      alert("Archivo subido correctamente."); // Cambiado de 'Formulario 7' a 'Archivo'
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("No se pudo subir el archivo.");
    } finally {
      pendingUploadRef.current = { folderId: null, rowId: null };
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar */}
        <Col
          md={2}
          className="bg-success d-flex flex-column align-items-center text-white py-4"
          style={{ minHeight: "100vh" }}
        >
          <img
            src="/src/assets/logo-urp.png"
            alt="URP"
            className="mb-3"
            style={{ width: "70px", height: "70px" }}
          />
          <h5 className="fw-bold mb-2">TITES</h5>
          <div className="text-center mb-4">
            <div className="fw-semibold">Usuario por definir</div>
            <div style={{ fontSize: "0.8rem" }}>COORDINADOR ACADÉMICO</div>
          </div>

          <div className="w-100 px-3">
            <Button
              variant="light"
              className="w-100 mb-2 text-start fw-semibold"
              active
            >
              Formularios Tesistas
            </Button>
          </div>

          <div className="mt-auto px-3 w-100">
            <Button variant="outline-light" className="w-100 fw-semibold">
              ⏻ Salir
            </Button>
          </div>
        </Col>

        {/* Main */}
        <Col md={10} className="bg-light px-4 py-3">
          {!token && (
            <Card className="mb-3 border-warning">
              <Card.Body>
                Necesitas conectar Google Drive para listar los documentos.
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              Gestión de Formularios F. TITES{" "}
              {loading && (
                <Spinner animation="border" size="sm" className="ms-2" />
              )}
            </h5>
            <div>
              <Button variant="outline-secondary" size="sm" className="me-2">
                🧳 Exportar Lista
              </Button>
              <Button variant="success" size="sm">
                📊 Ver Estadísticas
              </Button>
            </div>
          </div>

          <Card className="mb-3 shadow-sm">
            <Card.Body className="text-muted">
              Se listan todos los documentos cuyo nombre{" "}
              <strong>empieza</strong> con <strong>“F.TITES”</strong> de cada
              grupo de tesistas.
            </Card.Body>
          </Card>

          {/* Filters */}
          <Row className="align-items-center mb-2 g-2">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>🔎</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por grupo, nombre de archivo o tipo de F.TITES…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md="auto" className="text-muted small">
              Mostrando {filtered.length} de {tesis.length} filas
            </Col>
            <Col md="auto" className="ms-auto">
              <Dropdown onSelect={(k) => setStatusFilter(k || "todos")}>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  {statusFilter === "todos"
                    ? "Todos los estados"
                    : statusFilter[0].toUpperCase() + statusFilter.slice(1)}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item eventKey="todos">Todos</Dropdown.Item>
                  <Dropdown.Item eventKey="pendiente">Pendiente</Dropdown.Item>
                  <Dropdown.Item eventKey="aprobado">Aprobado</Dropdown.Item>
                  <Dropdown.Item eventKey="desaprobado">
                    Desaprobado
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>

          {/* Cards */}
          {filtered.map((t) => (
            <Card key={t.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Row className="align-items-center g-3">
                  <Col lg={4}>
                    <div className="d-flex align-items-center mb-2">
                      {fileIcon}
                      <div
                        className="fw-bold"
                        style={{ letterSpacing: ".4px" }}
                      >
                        {t.fileName}
                      </div>
                    </div>
                    <div className="text-muted small ms-4">
                      Grupo: <span className="fw-bold">{t.nombre}</span>
                    </div>
                    <div className="mt-2 ms-4">{badgeEstado(t.estado)}</div>
                    <div className="text-muted small mt-2 ms-4">
                      {t.ultima ? (
                        <>
                          Última modificación: {t.ultima}
                          {t.hora && ` — ${t.hora}`}
                        </>
                      ) : (
                        "Sin fecha"
                      )}
                    </div>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">ACCIONES</div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      href={t.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-2 w-100"
                    >
                      Abrir Doc. Drive
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => descargar(t.driveFileId, t.fileName)}
                      disabled={!t.driveFileId}
                      className="mb-2 w-100"
                    >
                      ⬇️ Descargar
                    </Button>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => openEstadoModal(t)}
                      className="w-100"
                    >
                      Ver Estado (Tesista)
                    </Button>
                    <a
                      href={t.groupWebLink}
                      target="_blank"
                      rel="noreferrer"
                      className="small mt-2"
                    >
                      Abrir carpeta del grupo ▸
                    </a>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">
                      APROBAR/RECHAZAR
                    </div>
                    <Button
                      variant={
                        t.estado === "aprobado" ? "success" : "outline-success"
                      }
                      onClick={() => setEstado(t.id, "aprobado")}
                      className="mb-2 w-100"
                    >
                      ✅ Aprobar
                    </Button>

                    <Button
                      variant={
                        t.estado === "desaprobado" ? "danger" : "outline-danger"
                      }
                      onClick={() => setEstado(t.id, "desaprobado")}
                      className="w-100"
                    >
                      ❌ Rechazar
                    </Button>
                  </Col>

                  <Col lg={4}>
                    <Form.Control
                      as="textarea"
                      rows={4} // Aumentamos el tamaño
                      placeholder="Comentarios / Correcciones Oficiales"
                      value={t.comentarios}
                      onChange={(e) => setComentario(t.id, e.target.value)}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* hidden input for uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />
        </Col>
      </Row>

      {/* --- Modal Estado y Correcciones (Copiado de TesistaView) --- */}
      {showEstadoModal && archivoSeleccionado && (
        <Modal
          show={showEstadoModal}
          onHide={() => setShowEstadoModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Estado del Formulario (Vista Tesista)</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Archivo:</strong> {archivoSeleccionado.name}
            </p>
            <p>
              <strong>Estado:</strong>
              <span
                className={
                  archivoSeleccionado.estado === "Aprobado"
                    ? "text-success fw-bold ms-1"
                    : archivoSeleccionado.estado === "Desaprobado"
                    ? "text-danger fw-bold ms-1"
                    : "text-warning fw-bold ms-1"
                }
              >
                {archivoSeleccionado.estado}
              </span>
            </p>
            <p>
              <strong>Correcciones:</strong>
            </p>
            <div className="border p-2 rounded bg-light">
              {archivoSeleccionado.comentarios ||
                "Sin observaciones registradas."}
            </div>
            <div className="mt-3 text-center">
              <Button
                variant="link"
                size="sm"
                href={`https://docs.google.com/document/d/${archivoSeleccionado.driveFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-decoration-none"
              >
                Abrir Archivo en Drive para Revisión
              </Button>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowEstadoModal(false)}
            >
              Cerrar
            </Button>
            {/* Solo mostramos la opción de 'Pedir otra aprobación' si el tesista lo ha hecho (simulado) */}
            {archivoSeleccionado.estado === "Desaprobado" && (
              <Button
                variant="primary"
                onClick={() => {
                  // Simulamos que el tesista pide otra aprobación
                  setEstado(archivoSeleccionado.id, "pendiente");
                  setShowEstadoModal(false);
                }}
              >
                Pedir otra aprobación (Simulación)
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
export default CoordinadorAcademicoView;
