import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "timeago.js";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Form,
  Modal,
} from "react-bootstrap";
import { Link } from "react-router-dom";

// Importa tus imágenes
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

// Componente funcional con Hooks
export default function AsesorView() {
  
  // --- Estados para manejar la UI y los datos ---
  const [usuario] = useState({ rol: localStorage.getItem("userRole") });
  const [files, setFiles] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  // Estado para alertas y mensajes al usuario
  const [alertMsg, setAlertMsg] = useState("");

  // --- Lógica de Drive ---
  const token = localStorage.getItem("googleToken");
  const asesorId = "67feb9c963919de7361d274e"; // ID harcodeado como en tu ejemplo

  // Cargar los grupos del asesor al montar el componente
  useEffect(() => {
    if (!asesorId) {
      console.error("No se encontró el ID del asesor.");
      return;
    }
    axios
      .get(`http://localhost:4000/api/drive/asesor/${asesorId}`)
      .then((res) => {
        setGrupos(res.data);
      })
      .catch((err) => {
        console.error("Error obteniendo grupos:", err);
        setAlertMsg("No se pudieron cargar los grupos asignados.");
      });
  }, [asesorId]);

  // Obtener los archivos cada vez que se selecciona un grupo nuevo
  useEffect(() => {
    if (grupoSeleccionado && token) {
      getFiles();
    } else {
      setFiles([]); // Limpia los archivos si no hay grupo seleccionado
    }
  }, [grupoSeleccionado, token]);

  // Función para obtener los archivos del grupo desde el backend
  const getFiles = async () => {
    if (!grupoSeleccionado || !token) return;
    try {
      setAlertMsg(""); // Limpia alertas previas
      const res = await axios.get(
        `http://localhost:4000/api/drive/files?folderId=${grupoSeleccionado.carpeta_grupo_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error("Error obteniendo archivos:", err.response || err.message);
      setAlertMsg("Error al obtener los archivos del grupo.");
    }
  };

  // Maneja el cambio en el selector de grupos
  const handleGrupoChange = (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex === "") {
      setGrupoSeleccionado(null);
    } else {
      setGrupoSeleccionado(grupos[selectedIndex]);
    }
  };

  // Función para abrir archivos en una nueva pestaña
  const handleOpenFile = (fileId) => {
    // Puedes construir la URL como necesites. Esta es una URL genérica de previsualización.
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Container fluid>
      <Row>
        {/* --- Sidebar (Barra Lateral) --- */}
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
            <h4 className="fw-bold"> TITES - Asesor</h4>
            <img
              src={asesor}
              className="img-fluid mb-2"
              alt="Foto Asesor"
              style={{ maxWidth: "150px", borderRadius: "50%", marginTop: 35 }}
            />
            <div className="mt-5">
              <h5>{usuario?.rol || "Rol"}</h5>
              <small>{usuario?.rol ? "USUARIO: " + usuario.rol : "Rol"}</small>
            </div>
          </div>

          <div className="d-grid gap-2">
            {/* Puedes dejar esto o quitarlo, ya que la selección principal estará bloqueada */}
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

        {/* --- Área de Contenido Principal --- */}
        <Col md={9} className="p-4">
          {/* Fila de Controles Superiores */}
          <Row className="mb-4 align-items-center">
            <Col md={8}>
              <h3>Archivos de Grupos Asignados</h3>
            </Col>
            <Col md={4} className="d-flex justify-content-end">
              {/* Selector de Grupos */}
              <Form.Select
                size="sm"
                value={
                  grupoSeleccionado
                    ? grupos.findIndex((g) => g._id === grupoSeleccionado._id)
                    : ""
                }
                onChange={handleGrupoChange}
                style={{ maxWidth: "250px" }}
              >
                <option value="">-- Selecciona un Grupo --</option>
                {grupos.map((grupo, index) => (
                  <option key={grupo._id} value={index}>
                    {grupo.grupo}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {alertMsg && <div className="alert alert-info">{alertMsg}</div>}

          {/* Listado de Archivos con diseño de tarjetas */}
          <div className="row">
            {grupoSeleccionado ? (
              files.length > 0 ? (
                files.map((file) => (
                  <div className="col-md-12 p-2" key={file.id}>
                    <Card className="mb-3">
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            {fileIcon}
                            <div>
                              <h5 className="mb-0">{file.name}</h5>
                              <small className="text-muted">
                                {file.mimeType}
                              </small>
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            {/* Puedes añadir botones para calificar aquí */}
                            <Button variant="secondary" size="sm">
                              Calificar
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
              ) : (
                <p>
                  El grupo <strong>{grupoSeleccionado.grupo}</strong> no tiene
                  archivos actualmente.
                </p>
              )
            ) : (
              <p>
                Por favor, selecciona un grupo desde el menú lateral o el
                selector para ver sus archivos.
              </p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
