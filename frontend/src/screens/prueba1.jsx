// src/components/DatosPersonalesUpload.jsx

import React, { useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";

export default function DatosPersonalesUpload() {
  const [formData, setFormData] = useState({
    nombres: "",
    dni: "",
    correo: "",
    foto: null,
  });

  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, foto: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });

      // Simulación de envío
      console.log("Datos básicos enviados:", formData);

      setAlert({
        type: "success",
        message: "Datos personales enviados correctamente.",
      });

      setFormData({ nombres: "", dni: "", correo: "", foto: null });
    } catch (error) {
      console.error("Error al subir datos:", error);
      setAlert({
        type: "danger",
        message: "Hubo un error al enviar los datos.",
      });
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card>
            <Card.Body>
              <h4 className="mb-4 text-center">Subir Datos Personales</h4>

              {alert.message && <Alert variant={alert.type}>{alert.message}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombres</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    placeholder="Ingrese sus nombres"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>DNI</Form.Label>
                  <Form.Control
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    placeholder="Ingrese su DNI"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Correo</Form.Label>
                  <Form.Control
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="Ingrese su correo"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Foto</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Form.Group>

                <div className="text-center">
                  <Button variant="success" type="submit">
                    Subir Datos
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
