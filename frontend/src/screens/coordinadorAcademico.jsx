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
  Modal,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

// --- URL de Turnitin (ACTUALIZADA con el nuevo enlace) ---
const TURNITIN_URL = "https://www.turnitin.com/login_page.asp?lang=es";

// --- INICIO: Icono de Archivo (Necesario para F.TITES 005) ---
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
// --- FIN: Icono de Archivo ---

function CoordinadorAcademicoView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [tesis, setTesis] = useState([]);

  // --- Estados para el Modal ---
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);

  // --- ID DEL DOCUMENTO BASE ---
  const ID_ESTATICO_FTITES_005 = "1b1ah_2VkZTOYcu1bqaQPYx1x2f3esqeR";
  // ------------------------------

  const fileInputRef = useRef(null);
  const pendingUploadRef = useRef({ folderId: null, rowId: null });

  // Load Drive data from backend on mount (LÓGICA ORIGINAL)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("googleToken");
        if (!token) return;
        setLoading(true);

        const r = await fetch(
          "/api/drive/coordinador-academico/tesis007/groups",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await r.json();

        const rows = [];
        (data || []).forEach((group) => {
          if (group.files && group.files.length) {
            group.files.forEach((f) => {
              const dt = f.modifiedTime ? new Date(f.modifiedTime) : null;
              rows.push({
                id: f.id,
                nombre: group.groupName,
                rol: "Tesista",
                fecha: dt ? dt.toISOString().slice(0, 10) : "",
                hora: dt ? dt.toTimeString().slice(0, 5) : "",
                driveUrl: f.webViewLink,
                estado: "pendiente",
                comentarios: "",
                ultima: dt ? dt.toISOString().slice(0, 10) : "",
                fileName: f.name,
                groupFolderId: group.groupFolderId,
                groupWebLink: group.groupWebLink,
                has007: true,
                mimeType: f.mimeType,
              });
            });
          } else {
            // no F.TITES 007 file — add placeholder row
            rows.push({
              id: `no-007-${group.groupFolderId}`,
              nombre: group.groupName,
              rol: "Tesista",
              fecha: "",
              hora: "",
              driveUrl: group.groupWebLink,
              estado: "pendiente",
              comentarios: "",
              ultima: "",
              fileName: "No tiene documento F.TITES 007",
              groupFolderId: group.groupFolderId,
              groupWebLink: group.groupWebLink,
              has007: false,
              mimeType: null,
            });
          }
        });

        setTesis(rows);
      } catch (e) {
        console.error("Drive groups fetch failed:", e);
        setTesis([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // Search + filter (LÓGICA ORIGINAL)
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

  // LÓGICA ORIGINAL
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

  // LÓGICA ORIGINAL
  const setEstado = (id, nuevo) => {
    setTesis((prev) =>
      prev.map((t) => (t.id === id ? { ...t, estado: nuevo } : t))
    );
  };

  // LÓGICA ORIGINAL
  const setComentario = (id, value) => {
    setTesis((prev) =>
      prev.map((t) => (t.id === id ? { ...t, comentarios: value } : t))
    );
  };

  // --- FUNCIÓN DESCARGAR (SOLO PARA F.TITES 007 - Mantiene lógica de API) ---
  const descargar = async (fileId, suggestedName = "F.TITES_007") => {
    try {
      const token = localStorage.getItem("googleToken");

      // 1. Iniciamos la solicitud de descarga
      const res = await fetch(
        `/api/drive/coordinador-academico/tesis007/${fileId}/download`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) {
        throw new Error("Download failed or file not found on Drive");
      }

      // 2. Procesa la descarga en el navegador
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = suggestedName.endsWith(".docx")
        ? suggestedName
        : `${suggestedName}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error("Descarga falló:", e);
      alert(
        "No se pudo descargar el archivo F.TITES 007. Revisa la consola para más detalles (ej: Token expirado)."
      );
    }
  };
  // -------------------------------------------------------------------------

  // Open file picker to upload F7 into the GROUP folder (LÓGICA ORIGINAL)
  const abrirSelector = (row) => {
    pendingUploadRef.current = { folderId: row.groupFolderId, rowId: row.id };
    if (fileInputRef.current) fileInputRef.current.value = "";
    fileInputRef.current?.click();
  };

  // LÓGICA ORIGINAL
  const onFilePicked = async (e) => {
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
      alert("Formulario 7 subido correctamente.");
    } catch (err) {
      console.error("Error subiendo F7:", err);
      alert("No se pudo subir el Formulario 7.");
    } finally {
      pendingUploadRef.current = { folderId: null, rowId: null };
    }
  };

  const token = localStorage.getItem("googleToken");

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Sidebar (LÓGICA ORIGINAL) */}
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
              F. TITES 007
            </Button>
          </div>

          <div className="mt-auto px-3 w-100">
            <Button variant="outline-light" className="w-100 fw-semibold">
              ⏻ Salir
            </Button>
          </div>
        </Col>

        {/* Main (LÓGICA ORIGINAL) */}
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
              F. TITES 007{" "}
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
              Se listan archivos cuyo nombre <strong>empieza</strong> con{" "}
              <strong>“F.TITES 007”</strong>, directamente dentro de cada
              carpeta de grupo.
            </Card.Body>
          </Card>

          {/* Filters (LÓGICA ORIGINAL) */}
          <Row className="align-items-center mb-2 g-2">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>🔎</InputGroup.Text>
                <Form.Control
                  placeholder="Buscar por grupo o nombre de archivo…"
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

          {/* Cards (LÓGICA ORIGINAL) */}
          {filtered.map((t) => (
            <Card key={t.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Row className="align-items-center g-3">
                  <Col lg={4}>
                    <div className="fw-bold" style={{ letterSpacing: ".4px" }}>
                      {t.nombre}
                    </div>
                    <div className="text-muted small">{t.fileName}</div>
                    <div className="mt-2">{badgeEstado(t.estado)}</div>
                    <div className="text-muted small mt-2">
                      {t.ultima ? (
                        <>
                          Última modificación: {t.ultima}
                          {t.hora && ` — ${t.hora}`}
                        </>
                      ) : (
                        "Sin fecha"
                      )}
                    </div>
                    <div className="mt-2">
                      <a
                        href={t.groupWebLink}
                        target="_blank"
                        rel="noreferrer"
                        className="small"
                      >
                        Abrir carpeta del grupo ▸
                      </a>
                    </div>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">DESCARGAR</div>
                    <Button
                      variant="outline-secondary"
                      onClick={() => t.has007 && descargar(t.id, t.fileName)}
                      disabled={!t.has007}
                      title={
                        t.has007
                          ? "Descargar"
                          : "No tiene documento F.TITES 007"
                      }
                    >
                      ⬇️
                    </Button>

                    <div className="text-muted small mt-3 mb-1">SUBIR F7</div>
                    <Button
                      variant="outline-secondary"
                      onClick={() => abrirSelector(t)}
                    >
                      ⬆️
                    </Button>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">APROBADO</div>
                    <Button
                      variant={
                        t.estado === "aprobado" ? "success" : "outline-success"
                      }
                      onClick={() => setEstado(t.id, "aprobado")}
                    >
                      ✅
                    </Button>

                    <div className="text-muted small mt-3 mb-1">
                      DESAPROBADO
                    </div>
                    <Button
                      variant={
                        t.estado === "desaprobado" ? "danger" : "outline-danger"
                      }
                      onClick={() => setEstado(t.id, "desaprobado")}
                    >
                      ❌
                    </Button>
                  </Col>

                  <Col lg={4}>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Comentarios"
                      value={t.comentarios}
                      onChange={(e) => setComentario(t.id, e.target.value)}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* --- INICIO: DOCUMENTO ESTATICO F.TITES 005 (Botones con redirección prioritaria) --- */}
          <Card
            key="static-ftites005"
            className="mb-3 shadow-sm border-secondary"
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  {fileIcon}
                  <div>
                    <h5 className="mb-0">
                      F.TITES 005 Inscripción y Registro del Proyecto de Tesis
                    </h5>
                    <small className="text-muted">
                      application/vnd.openxmlformats-officedocument.wordprocessingml.document
                    </small>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  {/* Botón Descargar: Abre Turnitin primero, luego descarga */}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      const downloadUrl = `https://docs.google.com/document/d/${ID_ESTATICO_FTITES_005}/export?format=docx`;

                      // 1. Abrir Turnitin inmediatamente (la acción principal del click)
                      window.open(TURNITIN_URL, "_blank");

                      // 2. Iniciar la descarga del archivo 005 (100ms después)
                      setTimeout(() => {
                        window.open(downloadUrl, "_self");
                      }, 100);
                    }}
                    title="Descargar la plantilla F.TITES 005 y abrir Turnitin"
                  >
                    Descargar
                  </Button>
                  {/* Botón Abrir (Existente) */}
                  <Button
                    variant="outline-primary"
                    size="sm"
                    href={`https://docs.google.com/document/d/${ID_ESTATICO_FTITES_005}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir
                  </Button>
                  {/* Botón Ver Estado (Existente) */}
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={() => {
                      setArchivoSeleccionado({
                        name: "F.TITES 005 Inscripción y Registro del Proyecto de Tesis",
                        estado: "Rechazado", // Estado de ejemplo
                        comentarios: "Sin observaciones (Ejemplo Estático).", // Comentario de ejemplo
                        driveFileId: ID_ESTATICO_FTITES_005, // ID real
                      });
                      setShowEstadoModal(true);
                    }}
                  >
                    Ver Estado
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
          {/* --- FIN DOCUMENTO ESTATICO F.TITES 005 SOLICITADO --- */}

          {/* hidden input for uploads (LÓGICA ORIGINAL) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />
        </Col>
      </Row>

      {/* --- INICIO: Modal copiado de TesistaView --- */}
      {showEstadoModal && archivoSeleccionado && (
        <Modal
          show={showEstadoModal}
          onHide={() => setShowEstadoModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Estado del Formulario (Simulación)</Modal.Title>
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
                    : archivoSeleccionado.estado === "Rechazado"
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
              {archivoSeleccionado.comentarios}
            </div>
            {/* Botón para abrir el doc en el modal */}
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
            {/* Lógica de 'Pedir otra aprobación' de TesistaView */}
            {archivoSeleccionado.estado === "Rechazado" && (
              <Button
                variant="primary"
                onClick={() => {
                  setArchivoSeleccionado({
                    ...archivoSeleccionado,
                    estado: "Pendiente",
                    comentarios:
                      "Se ha solicitado una nueva revisión (Ejemplo).",
                  });
                }}
              >
                Pedir otra aprobación
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      )}
      {/* --- FIN DEL MODAL --- */}
    </Container>
  );
}
export default CoordinadorAcademicoView;
