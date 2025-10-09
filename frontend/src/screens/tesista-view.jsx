import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Button, Card, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

// Puedes mantener tus imágenes si las necesitas
import logoUniversidad from "../assets/logo-urp1.png";
import asesor from "../assets/asesor.webp";

// Icono para representar un archivo genérico
const fileIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-file-earmark-text me-2" viewBox="0 0 16 16">
    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
  </svg>
);

// El componente ahora es funcional y usa Hooks (useState, useEffect)
export default function TesistaView() {
  
  // --- CAMBIO 1: Creamos un objeto fijo para el grupo del tesista y eliminamos el estado 'grupos' ---
  const grupoFijoParaTesista = {
      _id: 'grupo_tesista_fijo', // ID de placeholder
      grupo: 'Grupo 01',
      // Este es el ID de la carpeta de Drive que especificaste
      carpeta_grupo_id: '1LUqWYqCchFLnsgwcKvK7qB3UtgV_eyYs' 
  };
  
  // --- Estados del componente ---
  const [usuario] = useState({ rol: localStorage.getItem("userRole") });
  const [files, setFiles] = useState([]);
  // El grupo seleccionado ahora es siempre nuestro objeto fijo
  const [grupoSeleccionado] = useState(grupoFijoParaTesista);

  // --- NUEVO ESTADO PARA FILTRO ---
  const [filtroProceso, setFiltroProceso] = useState(""); 

  // Estados para la lógica de duplicado
  const [formularios, setFormularios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Estado para alertas y mensajes al usuario
  const [alertMsg, setAlertMsg] = useState("");

  const token = localStorage.getItem("googleToken");

  // --- CAMBIO 2: El useEffect ahora solo depende del token para cargar los archivos del grupo fijo ---
  useEffect(() => {
    if (token) {
      getFiles();
    } else {
        setAlertMsg("Inicia sesión con Google para ver tus archivos.");
    }
  }, [token]); // Se ejecuta solo cuando el token cambie

  // Función para obtener los archivos del grupo
  const getFiles = async () => {
    // La función ahora usa directamente el 'grupoSeleccionado' que es nuestro objeto fijo
    if (!grupoSeleccionado || !token) return; 
    try {
      const res = await axios.get(
        `http://localhost:4000/api/drive/files?folderId=${grupoSeleccionado.carpeta_grupo_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error("Error obteniendo archivos:", err.response || err.message);
      setAlertMsg("Error al obtener los archivos de tu grupo.");
    }
  };

  // Función para obtener la lista de formularios base (sin cambios)
  const getFormularios = async () => {
    if (!token) {
      setAlertMsg("No tienes token válido. Inicia sesión.");
      return;
    }
    try {
      const res = await axios.get(`http://localhost:4000/api/drive/formularios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormularios(res.data);
      return res.data;
    } catch (err) {
      console.error("Error cargando formularios:", err.response || err.message);
      setAlertMsg("Ocurrió un error al obtener los formularios.");
      return [];
    }
  };
  
  // Abre el modal de confirmación después de cargar los formularios (sin cambios)
  const confirmDuplicarFormularios = async () => {
    const formulariosObtenidos = await getFormularios();
    if (formulariosObtenidos.length > 0) {
        setShowModal(true);
    } else {
        setAlertMsg("No se encontraron formularios para duplicar o hubo un error al cargarlos.");
    }
  };

  // Maneja la duplicación una vez confirmada en el modal (sin cambios)
  const handleDuplicarConfirmado = async () => {
    if (!token || formularios.length === 0) {
      setAlertMsg("Token no disponible o no hay formularios para duplicar.");
      return;
    }
    try {
      setIsDuplicating(true);
      for (const file of formularios) {
        await axios.post(
          "http://localhost:4000/api/drive/duplicar-archivo",
          {
            fileId: file.id,
            carpetaDestinoId: grupoSeleccionado.carpeta_grupo_id,
            nombre: file.name,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setIsDuplicating(false);
      setShowModal(false);
      setShowToast(true);
      getFiles();
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error("Error duplicando archivos:", err.response || err.message);
      setAlertMsg("Ocurrió un error al duplicar.");
      setIsDuplicating(false);
      setShowModal(false);
    }
  };

  // --- CAMBIO 3: La función handleGrupoChange ya no es necesaria y se puede eliminar ---

  return (
    <Container fluid>
      <Row>
        {/* --- Sidebar (sin cambios de lógica) --- */}
        <Col
          style={{ width: "830px" }}
          className="bg-success text-white min-vh-100 p-3"
        >
          <div className="text-center mb-4">
            <img src={logoUniversidad} className="img-fluid mb-2" alt="Logo Universidad" style={{ maxWidth: "150px" }}/>
            <h4 className="fw-bold"> TITES </h4>
            <img src={asesor} className="img-fluid mb-2" alt="Foto Asesor" style={{ maxWidth: "150px", borderRadius: "50%", marginTop: 35 }}/>
            <div className="mt-5">
              <h5>{usuario?.rol || "Rol"}</h5>
              <small>{usuario?.rol ? "USUARIO:" + usuario.rol : "Rol"}</small>
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
            <Button variant="outline-light" size="sm" as={Link} to="/">Salir</Button>
          </div>
        </Col>

        {/* --- Área de Contenido Principal (Refactorizada) --- */}
        <Col md={9} className="p-4">
          
          {/* Fila de Controles Superiores */}
          <Row className="mb-4 align-items-center">
            <Col>
              {/* --- CAMBIO 4: Reemplazamos el selector por un título fijo --- */}
              <h3>Archivos de tu Grupo: <strong>{grupoSeleccionado.grupo}</strong></h3>
            </Col>
            <Col className="d-flex justify-content-end gap-2">
              {/* --- NUEVO SELECTOR SOLO PARA TESTEAR PROYECTO --- */}
              <Form.Select
                size="sm"
                value={filtroProceso}
                onChange={(e) => setFiltroProceso(e.target.value)}
                style={{ width: "250px", display: "inline-block" }}
              >
                <option value="">-- Selecciona una opción --</option>
                <option value="">Registrar Proyecto de Tesis</option>
                <option value="F.TITES 006">Testear Proyecto en Turnitin</option>
                <option value="asesoria">Asesoría Semanal</option> {/* <- valor único */}
                <option value="">Solicitar Revisión Final</option>
                <option value="">Revisión Final</option>
                <option value="">Cambiar Tesis</option>

              </Form.Select>

              {/* Botón para Duplicar Formularios, ahora siempre actúa sobre el grupo fijo */}
              <Button variant="outline-warning" size="sm" onClick={confirmDuplicarFormularios} disabled={files.length > 0} >
                Cargar Formularios a mi Grupo
              </Button>
            </Col>
          </Row>

          {alertMsg && (
            <div className="alert alert-warning alert-dismissible fade show" role="alert">
              {alertMsg}
              <button type="button" className="btn-close" onClick={() => setAlertMsg("")}></button>
            </div>
           )}

          {/* Listado de Archivos con diseño de tarjetas */}
          <div className="row">
            {files.length > 0 ? (
          files
            .filter(file => {
                    const nombre = file.name.toUpperCase().trim().replace(/^COPIA DE /, "");

                    // Solo archivos F.TITES
                    if (!nombre.includes("F.TITES")) return false;

                    // Mostrar ambos formularios si selecciona asesoría
                    if (filtroProceso === "asesoria") {
                      return (
                        nombre.includes("F.TITES 006") ||
                        nombre.includes("F.TITES 008")
                      );
                    }

                    // Mostrar todos si no hay filtro o coincide el texto exacto del filtro
                    if (filtroProceso) {
                      return nombre.includes(filtroProceso.toUpperCase());
                    }

                    return true;
                  })
            .map((file) => (
              <div className="col-md-12 p-2" key={file.id}>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        {fileIcon}
                        <div>
                          <h5 className="mb-0">
                            {file.name.replace(/^Copia de /i, "").replace(/\.docx$/i, "")}
                          </h5>
                          <small className="text-muted">{file.mimeType}</small>
                        </div>
                      </div>
                      {/* Botones de acción */}
                      <div className="d-flex gap-2">
                        {file.name.toUpperCase().includes("F.TITES 008") && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleEnviarFormulario(file)}
                          >
                            Enviar Formulario Semanal
                          </Button>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          href={`https://docs.google.com/document/d/${file.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))
            ) : (
              <p>No se encontraron archivos en tu grupo. Puedes cargar los formularios base con el botón de arriba.</p>
            )}
          </div>
        </Col>
      </Row>

      {/* --- Modal de Confirmación para Duplicar (sin cambios) --- */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Carga de Formularios</h5>
                {!isDuplicating && (
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                )}
              </div>
              <div className="modal-body">
                {isDuplicating ? (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border text-warning me-3" role="status" />
                    <span>Cargando archivos, por favor espera...</span>
                  </div>
                ) : (
                  <p>
                    ¿Estás seguro de que deseas cargar <strong>todos los formularios base</strong> a la carpeta de tu grupo <strong>{grupoSeleccionado?.grupo}</strong>?
                  </p>
                )}
              </div>
              {!isDuplicating && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="button" className="btn btn-warning" onClick={handleDuplicarConfirmado}>Confirmar Carga</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Toast de Notificación (sin cambios) --- */}
      {showToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
          <div className="toast show bg-success text-white">
            <div className="toast-header">
              <strong className="me-auto">Carga completa</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowToast(false)}></button>
            </div>
            <div className="toast-body">Los formularios se cargaron correctamente en la carpeta de tu grupo.</div>
          </div>
        </div>
      )}
    </Container>
  );
}