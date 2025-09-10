import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Card, ListGroup, Badge, Form, Modal, Alert, Toast, ToastContainer } from "react-bootstrap";
import logoUniversidad from "../assets/logo-urp1.png";

function CoordinadorGeneralView() {
  const [activeForm, setActiveForm] = useState("F. TITES 009");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [comments, setComments] = useState({});

  // Sample student data with more realistic information
  const [students, setStudents] = useState([
    { 
      id: 1, 
      name: "SAMANIEGO PAQUIRACHI", 
      status: "pendiente", 
      submissionDate: "2024-01-15",
      hasDocument: true,
      lastModified: "2024-01-20"
    },
    { 
      id: 2, 
      name: "RODRIGUEZ MARTINEZ", 
      status: "aprobado", 
      submissionDate: "2024-01-10",
      hasDocument: true,
      lastModified: "2024-01-18"
    },
    { 
      id: 3, 
      name: "GARCIA LOPEZ", 
      status: "desaprobado", 
      submissionDate: "2024-01-12",
      hasDocument: true,
      lastModified: "2024-01-19"
    },
    { 
      id: 4, 
      name: "FERNANDEZ TORRES", 
      status: "pendiente", 
      submissionDate: "2024-01-14",
      hasDocument: false,
      lastModified: "2024-01-21"
    },
    { 
      id: 5, 
      name: "MARTINEZ SILVA", 
      status: "aprobado", 
      submissionDate: "2024-01-08",
      hasDocument: true,
      lastModified: "2024-01-16"
    },
    { 
      id: 6, 
      name: "LOPEZ VARGAS", 
      status: "pendiente", 
      submissionDate: "2024-01-16",
      hasDocument: true,
      lastModified: "2024-01-22"
    }
  ]);

  const studentsPerPage = 3;

  // Filter and search functionality
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || 
      (statusFilter === "pendientes" && student.status === "pendiente") ||
      (statusFilter === "aprobados" && student.status === "aprobado") ||
      (statusFilter === "desaprobados" && student.status === "desaprobado");
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + studentsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, activeForm]);

  // Handle file download
  const handleDownload = (student) => {
    if (!student.hasDocument) {
      showNotification("No hay documento disponible para descargar", "warning");
      return;
    }
    
    // Simulate file download
    const link = document.createElement('a');
    link.href = '#';
    link.download = `${activeForm}_${student.name}.pdf`;
    link.click();
    
    showNotification(`Descargando documento de ${student.name}`, "info");
  };

  // Handle file upload
  const handleUpload = (student) => {
    setSelectedStudent(student);
    setModalType("upload");
    setShowModal(true);
  };

  // Handle approval/rejection
  const handleStatusChange = (studentId, newStatus) => {
    setStudents(prevStudents => 
      prevStudents.map(student => 
        student.id === studentId 
          ? { ...student, status: newStatus, lastModified: new Date().toISOString().split('T')[0] }
          : student
      )
    );
    
    const student = students.find(s => s.id === studentId);
    const statusText = newStatus === "aprobado" ? "aprobado" : "desaprobado";
    showNotification(`${student.name} ha sido ${statusText}`, newStatus === "aprobado" ? "success" : "danger");
  };

  // Handle comments
  const handleCommentChange = (studentId, comment) => {
    setComments(prev => ({
      ...prev,
      [studentId]: comment
    }));
  };

  // Save comment
  const saveComment = (studentId) => {
    const comment = comments[studentId] || "";
    if (comment.trim()) {
      showNotification("Comentario guardado exitosamente", "success");
    }
  };

  // Show notification
  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setAlertType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Export functionality
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nombre,Estado,Fecha Envío,Última Modificación\n" +
      filteredStudents.map(student => 
        `${student.name},${student.status},${student.submissionDate},${student.lastModified}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeForm}_lista_estudiantes.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification("Lista exportada exitosamente", "success");
  };

  // Statistics
  const getStatistics = () => {
    const total = filteredStudents.length;
    const approved = filteredStudents.filter(s => s.status === "aprobado").length;
    const rejected = filteredStudents.filter(s => s.status === "desaprobado").length;
    const pending = filteredStudents.filter(s => s.status === "pendiente").length;
    
    return { total, approved, rejected, pending };
  };

  const handleShowStats = () => {
    const stats = getStatistics();
    setAlertMessage(
      `Estadísticas para ${activeForm}: Total: ${stats.total}, Aprobados: ${stats.approved}, Desaprobados: ${stats.rejected}, Pendientes: ${stats.pending}`
    );
    setAlertType("info");
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // File upload simulation
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Update student document status
      setStudents(prevStudents => 
        prevStudents.map(student => 
          student.id === selectedStudent.id 
            ? { ...student, hasDocument: true, lastModified: new Date().toISOString().split('T')[0] }
            : student
        )
      );
      
      setShowModal(false);
      showNotification(`Documento subido exitosamente para ${selectedStudent.name}`, "success");
    }
  };

  return (
    <Container fluid className="p-0">
      <Row className="m-0">
        {/* Sidebar */}
        <Col md={2} className="bg-success text-white min-vh-100 p-3">
          <div className="text-center mb-4">
           <img
                           src={logoUniversidad}
                           className="img-fluid mb-2"
                           alt="Logo Universidad"
                           style={{ maxWidth: "150px" }}
                         />
            <h4 className="fw-bold">TITES</h4>
            <div className="mt-5">
              <h5>Laura Mendoza</h5>
              <small>COORDINADOR GENERAL</small>
            </div>
          </div>

          <div className="d-grid gap-2">
            {["F. TITES 009", "F. TITES 010", "F. TITES 012", "F. TITES 013", "F. TITES 016"].map((form) => (
              <Button
                key={form}
                variant={activeForm === form ? "light" : "outline-light"}
                className="text-start"
                onClick={() => setActiveForm(form)}
              >
                {form}
              </Button>
            ))}
          </div>

          <div className="mt-5 text-center">
            <Button variant="outline-light" size="sm" onClick={() => showNotification("Sesión cerrada", "info")}>
              🚪 Salir
            </Button>
          </div>
        </Col>

        {/* Main Content */}
        <Col md={10} className="p-4">
          {/* Toast Notifications */}
          <ToastContainer position="top-end" className="p-3">
            <Toast show={showToast} onClose={() => setShowToast(false)} bg={alertType}>
              <Toast.Header>
                <strong className="me-auto">Notificación</strong>
              </Toast.Header>
              <Toast.Body className="text-white">{toastMessage}</Toast.Body>
            </Toast>
          </ToastContainer>

          {/* Alert */}
          {showAlert && (
            <Alert variant={alertType} dismissible onClose={() => setShowAlert(false)}>
              {alertMessage}
            </Alert>
          )}

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <h3 className="mb-3 mb-md-0">{activeForm}</h3>
            <div className="d-flex gap-2">
              <Button variant="outline-success" onClick={handleExport}>
                📥 Exportar Lista
              </Button>
              <Button variant="success" onClick={handleShowStats}>
                📊 Ver Estadísticas
              </Button>
            </div>
          </div>

          <Card className="mb-4 bg-light">
            <Card.Body>
              <h5 className="mb-2">Descripción del Formulario</h5>
              <p className="text-secondary">{getFormDescription(activeForm)}</p>
            </Card.Body>
          </Card>

          {/* Filter and Search */}
          <div className="d-flex flex-column flex-md-row justify-content-between mb-4 gap-3">
            <Form.Group style={{ width: "100%", maxWidth: "300px" }}>
              <div className="position-relative">
                <Form.Control 
                  type="text" 
                  placeholder="🔍 Buscar tesista..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </Form.Group>
            <Form.Group>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="pendientes">Pendientes</option>
                <option value="aprobados">Aprobados</option>
                <option value="desaprobados">Desaprobados</option>
              </Form.Select>
            </Form.Group>
          </div>

          {/* Results count */}
          <div className="mb-3">
            <small className="text-muted">
              Mostrando {currentStudents.length} de {filteredStudents.length} estudiantes
            </small>
          </div>

          {/* Student List */}
          <ListGroup className="mb-4">
            {currentStudents.length === 0 ? (
              <Alert variant="info">No se encontraron estudiantes con los criterios de búsqueda.</Alert>
            ) : (
              currentStudents.map((student) => (
                <ListGroup.Item key={student.id} className="mb-3 p-0 border-0">
                  <Card>
                    <Card.Body className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                      <div style={{ minWidth: "200px" }}>
                        <h5 className="mb-0">{student.name}</h5>
                        <small>Tesista</small>
                        <div className="mt-1">
                          <Badge bg={
                            student.status === "aprobado" ? "success" : 
                            student.status === "desaprobado" ? "danger" : "warning"
                          }>
                            {student.status.toUpperCase()}
                          </Badge>
                          {!student.hasDocument && (
                            <Badge bg="secondary" className="ms-1">Sin documento</Badge>
                          )}
                        </div>
                        <small className="text-muted">
                          Última modificación: {student.lastModified}
                        </small>
                      </div>

                      {/* Download/Upload */}
                      <div className="text-center me-4">
                        <small className="d-block fw-bold text-secondary">DESCARGAR</small>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant={student.hasDocument ? "outline-success" : "outline-secondary"}
                            disabled={!student.hasDocument}
                            onClick={() => handleDownload(student)}
                          >
                            ⬇️
                          </Button>
                        </div>
                        <small className="d-block fw-bold text-secondary mt-2">SUBIR</small>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant="outline-success"
                            onClick={() => handleUpload(student)}
                          >
                            ⬆️
                          </Button>
                        </div>
                      </div>

                      {/* Approve/Disapprove */}
                      <div className="text-center me-4">
                        <small className="d-block fw-bold text-secondary">APROBADO</small>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant={student.status === "aprobado" ? "success" : "outline-success"}
                            onClick={() => handleStatusChange(student.id, "aprobado")}
                          >
                            ✅
                          </Button>
                        </div>
                        <small className="d-block fw-bold text-secondary mt-2">DESAPROBADO</small>
                        <div className="d-flex gap-2 justify-content-center">
                          <Button 
                            variant={student.status === "desaprobado" ? "danger" : "outline-danger"}
                            onClick={() => handleStatusChange(student.id, "desaprobado")}
                          >
                            ❌
                          </Button>
                        </div>
                      </div>

                      {/* Comments */}
                      <div className="w-100 w-md-25">
                        <Form.Control
                          as="textarea"
                          placeholder="Comentarios"
                          style={{ height: "80px", resize: "none" }}
                          value={comments[student.id] || getDefaultComment(student.status)}
                          onChange={(e) => handleCommentChange(student.id, e.target.value)}
                          onBlur={() => saveComment(student.id)}
                        />
                      </div>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))
            )}
          </ListGroup>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mx-1"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                ⬅️ Anterior
              </Button>
              
              {[...Array(totalPages)].map((_, index) => (
                <Button 
                  key={index + 1}
                  variant={currentPage === index + 1 ? "success" : "outline-secondary"}
                  size="sm" 
                  className="mx-1"
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}
              
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="mx-1"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente ➡️
              </Button>
            </div>
          )}
        </Col>
      </Row>

      {/* Upload Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>📤 Subir Documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Subir documento para: <strong>{selectedStudent?.name}</strong></p>
          <p>Formulario: <strong>{activeForm}</strong></p>
          <Form.Group>
            <Form.Label>Seleccionar archivo</Form.Label>
            <Form.Control 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
            <Form.Text className="text-muted">
              Formatos permitidos: PDF, DOC, DOCX (máximo 10MB)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

// Helper function to get form descriptions
function getFormDescription(formName) {
  const descriptions = {
    "F. TITES 009": "Formulario de evaluación del plan de tesis por el asesor temático. Incluye criterios de evaluación sobre la relevancia, metodología y viabilidad del proyecto.",
    "F. TITES 010": "Formulario de evaluación del plan de tesis por el asesor metodológico. Evalúa aspectos metodológicos, estructura y coherencia del plan.",
    "F. TITES 012": "Formulario de aprobación del borrador de tesis. Verifica que el documento cumpla con los requisitos formales y de contenido antes de la sustentación.",
    "F. TITES 013": "Formulario de evaluación de la sustentación de tesis. Califica la presentación oral y defensa del trabajo de investigación.",
    "F. TITES 016": "Formulario de verificación final de documentos. Confirma que todos los documentos requeridos estén completos para el archivo institucional."
  };

  return descriptions[formName] || "Descripción no disponible para este formulario.";
}

// Helper function to get default comments based on status
function getDefaultComment(status) {
  if (status === "aprobado") return "El trabajo cumple con los requisitos establecidos. Aprobado.";
  if (status === "desaprobado") return "El trabajo requiere correcciones importantes antes de ser aprobado.";
  return "";
}

export default CoordinadorGeneralView;