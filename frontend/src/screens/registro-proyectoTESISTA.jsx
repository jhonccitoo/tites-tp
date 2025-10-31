import React, { useState } from "react";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

// Puedes mantener tus imágenes si las necesitas
import logoUniversidad from "../assets/logo-urp1.png";
import asesor from "../assets/asesor.webp";

// Icono genérico para archivos
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

export default function TesistaView() {
  const [usuario] = useState({ rol: localStorage.getItem("userRole") });
  const [grupoSeleccionado, setGrupoSeleccionado] = useState("");

  // Archivos fijos solo para "Registrar Proyecto"
  const registrarProyectoFiles = [
    {
      id: "1kqXLRLZcOEIK67DtX1VfT36KF0z1GBTr",
      name: "F.TITES 003 - Nombre de Proyecto de Tesis.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      id: "1ftXeuB0MI0nToGAkmYOLkS2xTkIkht5c",
      name: "F.TITES 004 - Propuesta del Tema de Tesis.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      id: "1LBuNYG_WWc4h8rPelYW-GwMrVMWhSQtK",
      name: "F.TITES 005 - Inscripción y Registro del Proyecto de Tesis.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
    {
      id: "1eD_09t5kxgzfN8Q76h9Ebn1WrI5NM5eG",
      name: "F.TITES 006 - Esquema referencial para presentación de Proyecto o Plan de Tesis.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    },
  ];

  // Abrir archivo en Drive
  const handleOpenFile = (fileId) => {
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Calificar en Drive
  const handleEditFile = (fileId) => {
    const url = `https://docs.google.com/document/d/${fileId}/edit`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col
          style={{ width: "830px" }}
          className="bg-success text-white min-vh-100 p-3"
        >
          <div className="text-center mb-4">
            <img
              src={logoUniversidad}
              className="img-fluid mb-2"
              alt="Logo Universidad"
              style={{ maxWidth: "150px" }}
            />
            <h4 className="fw-bold"> TITES - Tesista</h4>
            <img
              src={asesor}
              className="img-fluid mb-2"
              alt="Foto Tesista"
              style={{ maxWidth: "150px", borderRadius: "50%", marginTop: 35 }}
            />
            <div className="mt-5">
              <h5>{usuario?.rol || "Rol"}</h5>
              <small>
                {usuario?.rol ? "USUARIO: " + usuario.rol : "Rol"}
              </small>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Button variant="outline-light">Mis Datos Personales</Button>
            <Button variant="outline-light">Formularios</Button>
            <Button variant="outline-light">Tesis</Button>
            <Button variant="outline-light">Metadatos</Button>
          </div>

          <div className="mt-5 text-center">
            <Button variant="outline-light" size="sm" as={Link} to="/">
              Salir
            </Button>
          </div>
        </Col>

        {/* Contenido Principal */}
        <Col md={9} className="p-4">
          <Row className="mb-4 align-items-center">
            <Col md={8}>
              <h3>Ciclo de Revisión de archivos</h3>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              {/* Menú fijo con 4 opciones */}
              <Form.Select
                size="sm"
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                style={{ maxWidth: "250px" }}
              >
                <option value="">-- Selecciona una Opción --</option>
                <option value="registrarProyecto">Registrar Proyecto</option>
                <option value="asesoriaSemanal">Asesoría Semanal</option>
              </Form.Select>
            </Col>
          </Row>

          {/* Archivos */}
          <div className="row">
            {grupoSeleccionado === "registrarProyecto" ? (
              registrarProyectoFiles.map((file) => (
                <div className="col-md-12 p-2" key={file.id}>
                  <Card className="mb-3">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          {fileIcon}
                          <div>
                            <h5 className="mb-0">{file.name}</h5>
                            <small className="text-muted">{file.mimeType}</small>
                          </div>
                        </div>
                        <div className="d-flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditFile(file.id)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenFile(file.id)}
                          >
                            Ver Archivo
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))
            ) : grupoSeleccionado ? (
              <p>
                Opción <strong>{grupoSeleccionado}</strong> aún no tiene archivos.
              </p>
            ) : (
              <p>Por favor, selecciona una opción del menú desplegable.</p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
