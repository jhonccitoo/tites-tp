import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import logoUniversidad from "../assets/logo-urp1.png";
import asesor from "../assets/asesor.webp";

export default function Revisor2View() {
  const [usuario] = useState({ rol: "Revisor2" });
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [files, setFiles] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [grupoModal, setGrupoModal] = useState(null);

  const token = localStorage.getItem("googleToken");

  // ── Cargar grupos disponibles para Revisor2
  useEffect(() => {
    const getGrupos = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/revisor/grupos/revisor2");
        setGrupos(res.data);
      } catch (err) {
        console.error("Error al obtener grupos:", err);
        setAlertMsg("Error al obtener la lista de grupos.");
      }
    };
    getGrupos();
  }, []);

  // ── Cargar archivos del grupo seleccionado
  useEffect(() => {
    const getFiles = async () => {
      if (!grupoSeleccionado || !token) return;
      try {
        const res = await axios.get(
          `http://localhost:4000/api/drive/files?folderId=${grupoSeleccionado.carpeta_grupo_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFiles(res.data);
      } catch (err) {
        console.error("Error obteniendo archivos:", err);
        setAlertMsg("Error al obtener los archivos de tu grupo.");
      }
    };
    if (grupoSeleccionado) getFiles();
  }, [grupoSeleccionado, token]);

  // ── Obtener grupo actualizado por ID (para modal)
  const fetchGrupoModal = async (id) => {
    try {
      const res = await axios.get(`http://localhost:4000/api/revisor/grupo/${id}`);
      setGrupoModal(res.data);
    } catch (err) {
      console.error("Error al obtener estado del grupo:", err);
      setAlertMsg("No se pudo cargar el estado del grupo.");
    }
  };

  // ── Marcar grupo como revisado (check2 = true)
  const handleCheck = async (id) => {
    try {
      const res = await axios.patch(`http://localhost:4000/api/revisor/check/${id}`, {
        revisor: "Revisor2"
      });
      const grupoActualizado = res.data.grupo;

      // Quitar el grupo aprobado de la lista de grupos
      setGrupos((prev) => prev.filter((g) => g._id !== id));

      // Limpiar selección y archivos para que desaparezca del UI
      setGrupoSeleccionado(null);
      setFiles([]);
      setGrupoModal(null);
      setShowModal(false);

    } catch (err) {
      console.error("Error al marcar check:", err);
      setAlertMsg("No se pudo marcar el grupo como revisado.");
    }
  };

  return (
    <Container fluid>
      <Row>
        {/* SIDEBAR */}
        <Col style={{ width: "830px" }} className="bg-success text-white min-vh-100 p-3">
          <div className="text-center mb-4">
            <img src={logoUniversidad} className="img-fluid mb-2" alt="Logo Universidad" style={{ maxWidth: "150px" }} />
            <h4 className="fw-bold">TITES</h4>
            <img src={asesor} className="img-fluid mb-2" alt="Foto Asesor" style={{ maxWidth: "150px", borderRadius: "50%", marginTop: 35 }} />
            <div className="mt-5">
              <h5>{usuario?.rol || "Rol"}</h5>
              <small>{usuario?.rol ? "USUARIO: " + usuario.rol : "Rol"}</small>
            </div>
          </div>
          <div className="d-grid gap-2">
            <Button variant="outline-light">Mis Datos Personales</Button>
            <Button variant="outline-light">Formularios</Button>
            <Button variant="outline-light">Tesis</Button>
            <Button variant="outline-light">Metadatos</Button>
          </div>
          <div className="mt-5 text-center">
            <Button variant="outline-light" size="sm" as={Link} to="/">Salir</Button>
          </div>
        </Col>

        {/* CONTENIDO PRINCIPAL */}
        <Col md={9} className="p-4">
          <Row className="mb-4 align-items-center">
            <Col>
              <h3>Grupos asignados para revisión</h3>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              <Form.Select
                size="sm"
                value={grupoSeleccionado?._id || ""}
                onChange={(e) => {
                  const grupo = grupos.find((g) => g._id === e.target.value);
                  setGrupoSeleccionado(grupo || null);
                  setFiles([]);
                }}
                style={{ width: "250px" }}
              >
                <option value="">-- Selecciona un grupo --</option>
                {grupos.map((g) => (
                  <option key={g._id} value={g._id}>{g.nombreArchivo}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Alertas */}
          {alertMsg && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              {alertMsg}
              <button type="button" className="btn-close" onClick={() => setAlertMsg("")}></button>
            </div>
          )}

          {/* Archivos del grupo */}
          {!grupoSeleccionado ? (
            <div className="alert alert-info">Selecciona un grupo para ver los archivos.</div>
          ) : (
            <div className="row">
              {files.filter((file) => file.name.includes("F.TITES 013")).length > 0 ? (
                files.filter((file) => file.name.includes("F.TITES 013")).map((file) => (
                  <div className="col-md-12 p-2" key={file.id}>
                    <Card className="mb-3 shadow-sm">
                      <Card.Body className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5>{file.name.replace(/^Copia de /i, "").replace(/\.docx$/i, "")}</h5>
                          <small>{file.mimeType}</small>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            href={`https://docs.google.com/document/d/${file.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir
                          </Button>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => {
                              fetchGrupoModal(grupoSeleccionado._id);
                              setShowModal(true);
                            }}
                          >
                            Ver Estado
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </div>
                ))
              ) : (
                <p>No se encontraron archivos F.TITES 013 en este grupo.</p>
              )}
            </div>
          )}

          {/* Modal Estado del Grupo */}
          {showModal && grupoModal && (
            <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Estado del Grupo</h5>
                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Nombre del grupo:</strong> {grupoModal.nombreArchivo}</p>
                    <p><strong>Estado:</strong>
                      <span className={
                        grupoModal.estado === "EN REVISIÓN" ? "text-warning fw-bold" :
                        grupoModal.estado === "REVISADO" ? "text-success fw-bold" :
                        "text-secondary fw-bold"
                      }>
                        {grupoModal.estado || "PENDIENTE"}
                      </span>
                    </p>
                    <p><strong>Check Revisor1:</strong> {grupoModal.check1 ? "✅" : "❌"}</p>
                    <p><strong>Check Revisor2:</strong> {grupoModal.check2 ? "✅" : "❌"}</p>
                  </div>
                  <div className="modal-footer">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                    {!grupoModal.check2 && (
                      <Button variant="success" onClick={() => handleCheck(grupoModal._id)}>✅ Aprobar</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </Col>
      </Row>
    </Container>
  );
}
