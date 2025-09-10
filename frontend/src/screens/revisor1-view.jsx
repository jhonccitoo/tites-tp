import React, { Component } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Container, Row, Col, Button, Card, ListGroup } from "react-bootstrap";
import logoUniversidad from "../assets/logo-urp1.png";
import { Link } from "react-router-dom";
import asesor from "../assets/asesor.webp";

export default class Noteslist extends Component {
  state = {
    notes: [],
    filterTerm: "", // Para un campo de búsqueda
    activeFilter: "",
  };

  handleFilterByTitle = (searchTerm) => {
    this.setState({ activeFilter: searchTerm });
  };

  componentDidMount() {
    this.getNotes();
  }

  async getNotes() {
    const res = await axios.get("http://localhost:4000/api/notes");
    this.setState({ notes: res.data }, () => {
      // Callback después de obtener las notas
      const userRole = localStorage.getItem("userRole");
      if (userRole === "revisor1") {
        // Reemplaza "asesor" con el rol correcto
        this.setState({ activeFilter: "F.TITES 010" });
      }
    });
  }

  deleteNote = async (id) => {
    await axios.delete(`http://localhost:4000/api/notes/${id}`);
    this.getNotes();
  };

  handleRedireccionar = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  render() {
    const usuario = { rol: localStorage.getItem("userRole") };
    const { notes, activeFilter } = this.state;
    const filteredNotes = activeFilter
      ? notes.filter((note) =>
          note.title.toLowerCase().includes(activeFilter.toLowerCase())
        )
      : notes;

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
              <h4 className="fw-bold"> TITES </h4>
        
              <img
                src={asesor}
                className="img-fluid mb-2"
                alt="Foto Asesor"
                style={{
                  maxWidth: "150px",
                  borderRadius: "50%",
                  marginTop: 35,
                }}
              />

              <div className="mt-5">
                <h5>{usuario?.rol || "Rol"}</h5>{" "}
                <small>{usuario?.rol ? "USUARIO:" + usuario.rol : "Rol"}</small>
              </div>
            </div>

            <div className="d-grid gap-2">
              <Button
                variant="outline-light"
                onClick={() => this.handleFilterByTitle("F.TITES 010")}
              >
                Filtrar por F.TITES 010
              </Button>
              <Button
                variant="outline-light"
                onClick={() => this.handleFilterByTitle("F.TITES 012")}
              >
                Filtrar por F.TITES 012
              </Button>
              <Button
                variant="outline-light"
                onClick={() => this.handleFilterByTitle("F.TITES 013")}
              >
                Filtrar por F.TITES 013
              </Button>
            </div>
            <div className="mt-5 text-center">
              <Button variant="outline-light" size="sm">
                <Link to="/">Salir</Link>
              </Button>
            </div>
          </Col>

          <Col md={9} className="p-4">
            <div className="row">
              {filteredNotes.map((note) => (
                <div className="col-md-12 p-2" key={note._id}>
                  <Card className="mb-3">
                    <Card.Body className="d-flex flex-column">
                      {" "}
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h5 className="mb-0">{note.title}</h5>
                          <small>{note.author}</small>
                        </div>
                        {usuario?.rol !== "tesista" && (
                          <Link
                            className="btn btn-secondary btn-sm"
                            to={`/edit/${note._id}`}
                          >
                            Calificar
                          </Link>
                        )}
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="text-center me-4">
                          <small className="d-block fw-bold text-secondary">
                            FORMULARIO 
                          </small>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => 
                                {usuario?.rol == "tesista" && ( this.handleRedireccionar(
                                  "https://drive.google.com/drive/folders/1X4THssnsB4ZqGrzBd2H473U_GIHa1b12?usp=drive_link"
                                ) ) }
                              }
                            >
                              ⬇
                            </Button>
                          </div>
                          <small className="d-block fw-bold text-secondary mt-2">
                            SUBIR
                          </small>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() =>
                                this.handleRedireccionar(
                                  "https://drive.google.com/drive/folders/1X4THssnsB4ZqGrzBd2H473U_GIHa1b12?usp=drive_link"
                                )
                              }
                            >
                              ⬆
                            </Button>
                          </div>
                        </div>

                        <small className="text-muted me-3">
                          {format(note.date)}
                        </small>

                        <textarea
                          placeholder="Comentarios"
                          className="form-control w-25 me-4"
                          style={{ height: "120px", resize: "none" }}
                          defaultValue={note.content}
                        ></textarea>

                        <div className="text-center me-4">
                          <small className="d-block fw-bold text-secondary">
                            APROBADO
                          </small>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant={
                                note.approvalStatus === "2"
                                  ? "success"
                                  : "outline-secondary"
                              }
                              size="sm"
                            >
                              {note.approvalStatus === "2" ? "✔" : "☐"}
                            </Button>
                          </div>
                          <small className="d-block fw-bold text-secondary mt-2">
                            DESAPROBADO
                          </small>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant={
                                note.approvalStatus === "1"
                                  ? "danger"
                                  : "outline-secondary"
                              }
                              size="sm"
                            >
                              {note.approvalStatus === "1" ? "✘" : "☐"}
                            </Button>
                          </div>
                        </div>

                        {usuario?.rol !== "tesista" && (
                          <div className="text-center me-4">
                            <small className="d-block fw-bold text-secondary">
                              MANDAR A CARPETA FINAL
                            </small>
                            <div className="d-flex gap-2 justify-content-center">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  this.handleRedireccionar(
                                    "https://drive.google.com/drive/folders/1iNe9_5MSC0yr-Tv1KQQx4NxqKtXnECVR?usp=sharing"
                                  )
                                }
                              >
                                ✉️
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="d-flex justify-content-end">
                        {usuario?.rol !== "tesista" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => this.deleteNote(note._id)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
