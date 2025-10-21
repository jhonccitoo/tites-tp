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
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

function CoordinadorAcademicoView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [tesis, setTesis] = useState([]);

  const fileInputRef = useRef(null);
  const pendingUploadRef = useRef({ folderId: null, rowId: null });

  // Load Drive data from backend on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("googleToken");
        if (!token) return;
        setLoading(true); // CHANGED: start spinner

        const r = await fetch("/api/drive/coordinador-academico/tesis007/groups", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json(); // [{ groupName, groupFolderId, groupWebLink, files: [] }]

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
        setLoading(false); // CHANGED: stop spinner
      }
    };

    fetchGroups();
  }, []);

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
    setTesis((prev) => prev.map((t) => (t.id === id ? { ...t, estado: nuevo } : t)));
  };

  const setComentario = (id, value) => {
    setTesis((prev) => prev.map((t) => (t.id === id ? { ...t, comentarios: value } : t)));
  };

  // Download via backend stream
  const descargar = async (fileId, suggestedName = "F.TITES_007") => {
    try {
      const token = localStorage.getItem("googleToken");
      const res = await fetch(
        `/api/drive/coordinador-academico/tesis007/${fileId}/download`,
        { headers: { Authorization: `Bearer ${token}` } } // CHANGED: fixed header
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = suggestedName.endsWith(".pdf") ? suggestedName : `${suggestedName}`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error("Descarga falló:", e);
      alert("No se pudo descargar el archivo.");
    }
  };

  // Open file picker to upload F7 into the GROUP folder
  const abrirSelector = (row) => {
    // CHANGED: use groupFolderId (your current structure is root -> group -> files)
    pendingUploadRef.current = { folderId: row.groupFolderId, rowId: row.id };
    if (fileInputRef.current) fileInputRef.current.value = ""; // reset
    fileInputRef.current?.click();
  };

  const onFilePicked = async (e) => {
    const file = e.target.files?.[0];
    const { folderId } = pendingUploadRef.current || {};
    if (!file || !folderId) return;
    try {
      const token = localStorage.getItem("googleToken");
      const form = new FormData();
      form.append("file", file); // usually PDF for F7

      const r = await fetch(`/api/drive/upload?folderId=${encodeURIComponent(folderId)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
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
            <Button variant="light" className="w-100 mb-2 text-start fw-semibold" active>
              F. TITES 007
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
                {/* You can place your ConnectGoogleButton here if you added it */}
              </Card.Body>
            </Card>
          )}

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              F. TITES 007 {loading && <Spinner animation="border" size="sm" className="ms-2" />}
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
              Se listan archivos cuyo nombre <strong>empieza</strong> con <strong>“F.TITES 007”</strong>,
              directamente dentro de cada carpeta de grupo.
            </Card.Body>
          </Card>

          {/* Filters */}
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
                  <Dropdown.Item eventKey="desaprobado">Desaprobado</Dropdown.Item>
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
                    <div className="fw-bold" style={{ letterSpacing: ".4px" }}>
                      {t.nombre}
                    </div>
                    <div className="text-muted small">{t.fileName}</div>
                    <div className="mt-2">{badgeEstado(t.estado)}</div>
                    <div className="text-muted small mt-2">
                      {t.ultima
                        ? <>Última modificación: {t.ultima}{t.hora && ` — ${t.hora}`}</>
                        : "Sin fecha"}
                    </div>
                    <div className="mt-2">
                      <a href={t.groupWebLink} target="_blank" rel="noreferrer" className="small">
                        Abrir carpeta del grupo ▸
                      </a>
                    </div>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">DESCARGAR</div>
                    <Button
                      variant="outline-secondary"
                      onClick={() => t.has007 && descargar(t.id, t.fileName)}
                      disabled={!t.has007} // CHANGED: disable if no 007
                      title={t.has007 ? "Descargar" : "No tiene documento F.TITES 007"}
                    >
                      ⬇️
                    </Button>

                    <div className="text-muted small mt-3 mb-1">SUBIR F7</div>
                    <Button variant="outline-secondary" onClick={() => abrirSelector(t)}>
                      ⬆️
                    </Button>
                  </Col>

                  <Col lg={2} className="d-flex flex-column align-items-center">
                    <div className="text-muted small mb-1">APROBADO</div>
                    <Button
                      variant={t.estado === "aprobado" ? "success" : "outline-success"}
                      onClick={() => setEstado(t.id, "aprobado")}
                    >
                      ✅
                    </Button>

                    <div className="text-muted small mt-3 mb-1">DESAPROBADO</div>
                    <Button
                      variant={t.estado === "desaprobado" ? "danger" : "outline-danger"}
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

          {/* hidden input for uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={onFilePicked}
          />
        </Col>
      </Row>
    </Container>
  );
}
export default CoordinadorAcademicoView;
