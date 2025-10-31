import React, { Component } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export default class Navigation extends Component {
  render() {
    const usuario = { rol: localStorage.getItem('userRole') };

    return (
      <>
        <Navbar bg="light" data-bs-theme="light">
          <Container>
            <Navbar.Brand href="/">TITES - URP</Navbar.Brand>
            <Nav className="me-right">
              {/* Opción solo para ADMIN */}
              {usuario?.rol === 'admin' && (
                <Nav.Link href="/notas">Formularios</Nav.Link>
              )}

              {/* Opción para todos menos TESISTA */}
              {usuario?.rol !== 'tesista' && (
                <Nav.Link href="/create">Crear Formularios</Nav.Link>
              )}

              {/* Opción solo para SECRETARIA */}
              {usuario?.rol === 'secretaria' && (
                <Nav.Link href="/secretaria">Secretaría</Nav.Link>
              )}
            </Nav>
          </Container>
        </Navbar>
      </>
    );
  }
}