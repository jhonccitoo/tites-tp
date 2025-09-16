// src/components/RegistrarUsuario.jsx

import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

export default function RegistrarUsuario() {
  const [formData, setFormData] = useState({
    nombres: "",
    dni: "",
    correo: "",
    telefono: "",
    codigo: "",
    facultad: "",
    ciclo: "",
    tema: "",
    asesor: "",
  });

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Manejar cambios en inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validar datos
  const validate = () => {
    let newErrors = {};

    if (!formData.nombres.trim()) newErrors.nombres = "El nombre es obligatorio.";
    if (!/^\d{8}$/.test(formData.dni))
      newErrors.dni = "El DNI debe tener 8 dígitos.";
    if (!/\S+@\S+\.\S+/.test(formData.correo))
      newErrors.correo = "Correo inválido.";
    if (formData.telefono && !/^\d{9}$/.test(formData.telefono))
      newErrors.telefono = "El teléfono debe tener 9 dígitos.";
    if (!formData.codigo.trim())
      newErrors.codigo = "El código de estudiante es obligatorio.";
    if (!formData.facultad.trim())
      newErrors.facultad = "Debe ingresar la facultad.";
    if (!formData.ciclo.trim())
      newErrors.ciclo = "Debe ingresar el ciclo.";
    if (!formData.tema.trim())
      newErrors.tema = "Debe ingresar un tema tentativo.";
    if (!formData.asesor.trim())
      newErrors.asesor = "Debe ingresar el nombre del asesor.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      setAlert({ type: "danger", message: "Por favor corrige los errores." });
      return;
    }

    // Simulación de envío (aquí luego irá el backend con MongoDB)
    console.log("Usuario registrado:", formData);
    setAlert({ type: "success", message: "Usuario registrado correctamente." });

    // Resetear formulario
    setFormData({
      nombres: "",
      dni: "",
      correo: "",
      telefono: "",
      codigo: "",
      facultad: "",
      ciclo: "",
      tema: "",
      asesor: "",
    });
    setErrors({});
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <h4 className="mb-4 text-center">Registrar Usuario TITES</h4>

              {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

              <Form onSubmit={handleSubmit}>
                {/* Nombres */}
                <Form.Group className="mb-3">
                  <Form.Label>Nombres completos</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    isInvalid={!!errors.nombres}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nombres}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  {/* DNI */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>DNI</Form.Label>
                      <Form.Control
                        type="text"
                        name="dni"
                        value={formData.dni}
                        onChange={handleChange}
                        isInvalid={!!errors.dni}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.dni}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  {/* Teléfono */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="text"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        isInvalid={!!errors.telefono}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.telefono}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Correo */}
                <Form.Group className="mb-3">
                  <Form.Label>Correo institucional</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    isInvalid={!!errors.correo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.correo}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Código */}
                <Form.Group className="mb-3">
                  <Form.Label>Código de estudiante</Form.Label>
                  <Form.Control
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    isInvalid={!!errors.codigo}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.codigo}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Facultad */}
                <Form.Group className="mb-3">
                  <Form.Label>Facultad</Form.Label>
                  <Form.Control
                    type="text"
                    name="facultad"
                    value={formData.facultad}
                    onChange={handleChange}
                    isInvalid={!!errors.facultad}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.facultad}
                  </Form.Control.Feedback>
                </Form.Group>

                <Row>
                  {/* Ciclo */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Ciclo / Semestre</Form.Label>
                      <Form.Control
                        type="text"
                        name="ciclo"
                        value={formData.ciclo}
                        onChange={handleChange}
                        isInvalid={!!errors.ciclo}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.ciclo}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  {/* Asesor */}
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Asesor</Form.Label>
                      <Form.Control
                        type="text"
                        name="asesor"
                        value={formData.asesor}
                        onChange={handleChange}
                        isInvalid={!!errors.asesor}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.asesor}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Tema */}
                <Form.Group className="mb-3">
                  <Form.Label>Tema tentativo</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="tema"
                    value={formData.tema}
                    onChange={handleChange}
                    isInvalid={!!errors.tema}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.tema}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Botones */}
                <div className="text-center">
                  <Button variant="success" type="submit">
                    Registrar
                  </Button>
                  <Button
                    variant="secondary"
                    className="ms-2"
                    type="reset"
                    onClick={() => {
                      setFormData({
                        nombres: "",
                        dni: "",
                        correo: "",
                        telefono: "",
                        codigo: "",
                        facultad: "",
                        ciclo: "",
                        tema: "",
                        asesor: "",
                      });
                      setErrors({});
                      setAlert({ type: "", message: "" });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
