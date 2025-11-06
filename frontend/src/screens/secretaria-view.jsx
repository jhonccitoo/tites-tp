import React, { useEffect, useState } from "react";
import axios from "axios";

const SecretariaView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [revealedPasswordId, setRevealedPasswordId] = useState(null);

  const confirmarRegistro = async (id) => {
    try {
      await axios.post(`http://localhost:4000/api/pending-users/approve/${id}`);
      
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setShowConfirm(false);
      setSelectedStudent(null);
      setSuccessMsg("Usuario aprobado y registrado exitosamente.");
      
    } catch (err) {
      console.error("Error confirmando registro:", err);
      const errorMsg = err.response?.data?.message || "Error: No se pudo confirmar el registro.";
      window.alert(errorMsg);
    }
  };

    const marcarComoPagado = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/pending-users/pago/${id}`, {
        pagoRealizado: true,
      });
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, pagoRealizado: true } : s))
      );
      setSelectedStudent((prev) => ({ ...prev, pagoRealizado: true }));
      setSuccessMsg("Estado actualizado a Pagado");
    } catch (err) {
      console.error("Error actualizando estado de pago:", err);
      const errorMsg = err.response?.data?.message || "Error al marcar el pago.";
      window.alert(errorMsg);
    }
 };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/pending-users");
        setStudents(res.data);
      } catch (err) {
        console.error("Error cargando estudiantes:", err);
        setStudents([
          {
            _id: "1",
            nombre: "Juan",
            apellido: "Pérez",
            usuario: "jperez",
            password: "mipassword123",
            correoInstitucional: "juan.perez@urp.edu.pe",
            pagoRealizado: true,
            validado: false,
          },
          {
            _id: "2",
            nombre: "Ana",
            apellido: "López",
            usuario: "alopez",
            password: "ana.password",
            correoInstitucional: "ana.lopez@urp.edu.pe",
            pagoRealizado: false,
            validado: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const togglePasswordVisibility = (e, id) => {
    e.stopPropagation();
    
    if (revealedPasswordId === id) {
      setRevealedPasswordId(null);
    } else {
      setRevealedPasswordId(id);
    }
  };

  const style = `
    .secretaria-bg {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      padding: 2rem 3vw;
      gap: 2vw;
    }
    .secretaria-excel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(40,167,69,0.08);
      padding: 2.2rem 2.2rem 1.7rem 2.2rem;
      min-width: 800px;
      max-width: 1200px;
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    .secretaria-panel {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(40,167,69,0.08);
      padding: 2.5rem 2.5rem 2rem 2.5rem;
      min-width: 480px;
      max-width: 600px;
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: fit-content;
    }
    .secretaria-title {
      color: #6c757d;
      margin-bottom: 1rem;
      text-align: left;
      font-weight: 600;
      font-size: 1.5rem;
    }
    .secretaria-desc {
      color: #6c757d;
      margin-bottom: 1rem;
      text-align: left;
      font-size: 1rem;
    }
    .secretaria-table {
      font-size: 0.95rem;
      margin-top: 0.5rem;
    }
    .secretaria-table {
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(40,167,69,0.08);
      width: 100%;
      background: #f8f9fa;
      border-collapse: collapse;
      margin-top: 15px;
    }
    .secretaria-table th, .secretaria-table td {
      padding: 12px 18px;
      text-align: center;
      border-bottom: 1px solid #dee2e6;
    }
    .secretaria-table th {
      background: linear-gradient(135deg, #6c757d, #28a745);
      color: #fff;
      font-weight: 600;
    }
    .secretaria-table tr:nth-child(even) {
      background: #e9ecef;
    }
    .secretaria-table tr:nth-child(odd) {
      background: #f8f9fa;
    }
    .estado-pagado {
      color: #28a745;
      font-weight: bold;
    }
    .estado-no-pagado {
      color: #dc3545;
      font-weight: bold;
    }
    .btn-confirmar {
      background: linear-gradient(135deg, #6c757d, #28a745);
      color: white;
      border: none;
      border-radius: 25px;
      padding: 0.5rem 1.2rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .btn-confirmar:hover {
      background: linear-gradient(135deg, #28a745, #6c757d);
      transform: translateY(-2px);
    }
  `;

  if (loading) return <p style={{ textAlign: "center" }}>Cargando estudiantes...</p>;

  return (
    <div className="secretaria-bg">
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div className="secretaria-excel">
        <h1 className="secretaria-title">Lista de Tesistas</h1>
        <p className="secretaria-desc">Estudiantes y sus datos:</p>
        {successMsg && (
          <div
            className="alert alert-success"
            role="alert"
            style={{
              width: '100%',
              textAlign: 'center',
              marginBottom: '1rem',
              backgroundColor: '#d4edda',
              color: '#155724',
              padding: '0.75rem 1.25rem',
              border: '1px solid #c3e6cb',
              borderRadius: '0.25rem'
            }}
          >
            {successMsg}
          </div>
        )}
        <table className="secretaria-table">
          <thead>
            <tr>
              <th style={{ whiteSpace: "nowrap" }}>Nombre</th>
              <th style={{ whiteSpace: "nowrap" }}>Apellido</th>
              <th style={{ whiteSpace: "nowrap" }}>Email</th>
              <th style={{ whiteSpace: "nowrap" }}>Usuario</th>
              <th style={{ whiteSpace: "nowrap" }}>Contraseña</th>
              <th style={{ whiteSpace: "nowrap" }}>Estado de Pago</th>
              <th style={{ whiteSpace: "nowrap" }}>Registro Confirmado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student._id}
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedStudent(student);
                  setShowConfirm(false);
                  setSuccessMsg("");
                  setRevealedPasswordId(null);
                }}
              >
                <td>{student.nombre || "-"}</td>
                <td>{student.apellido || "-"}</td>
                <td>{student.correoInstitucional || "-"}</td>
                
                <td>{student.usuario || "-"}</td>
                
                <td>
                  {revealedPasswordId === student._id
                    ? student.password
                    : "********"}
                  
                  <button
                    onClick={(e) => togglePasswordVisibility(e, student._id)}
                    style={{
                      marginLeft: "10px",
                      padding: "2px 8px",
                      fontSize: "0.8rem",
                      borderRadius: "10px",
                      border: "1px solid #6c757d",
                      background: "#f8f9fa",
                      cursor: "pointer",
                    }}
                  >
                    {revealedPasswordId === student._id ? "Ocultar" : "Mostrar"}
                  </button>
                </td>
                <td
                  className={
                    student.pagoRealizado ? "estado-pagado" : "estado-no-pagado"
                  }
                >
                  {student.pagoRealizado ? "Pagado" : "No Pagado"}
                </td>
                <td>{student.validado ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div className="secretaria-panel">
          <h2
            style={{
              color: "#28a745",
              fontSize: "1.3rem",
              marginBottom: "1.5rem",
              textAlign: "center",
              width: "100%",
            }}
          >
            Registrar Pago
          </h2>
          {successMsg && selectedStudent && (
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                marginBottom: '1rem',
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '0.75rem 1.25rem',
                border: '1px solid #c3e6cb',
                borderRadius: '0.25rem'
              }}
            >
              {successMsg}
            </div>
          )}

          <div
            style={{
              marginBottom: "1.2rem",
              textAlign: "left",
              display: 'inline-block',
              width: "auto",
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Nombre:
              </b>
              <span>{selectedStudent.nombre}</span>
            </div>
            
            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Apellido:
              </b>
              <span>{selectedStudent.apellido}</span>
            </div>

            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Email:
              </b>
              <span>{selectedStudent.correoInstitucional || "-"}</span>
            </div>
            
            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Usuario:
              </b>
              <span>{selectedStudent.usuario || "-"}</span>
            </div>

            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Estado de Pago:
              </b>
              <span
                className={
                  selectedStudent.pagoRealizado
                    ? "estado-pagado"
                    : "estado-no-pagado"
                }
              >
                {selectedStudent.pagoRealizado ? "Pagado" : "No Pagado"}
              </span>
            </div>

            <div style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
              <b style={{ display: 'inline-block', minWidth: '150px' }}>
                Registro Confirmado:
              </b>
              <span>{selectedStudent.validado ? "Sí" : "No"}</span>
            </div>
          </div>
          
          {!selectedStudent.pagoRealizado && (
            <button
              className="btn-confirmar"
              style={{ display: "block", margin: "0 auto 1rem auto" }}
              onClick={() => marcarComoPagado(selectedStudent._id)}
            >
              Marcar como Pagado
            </button>
          )}

          {selectedStudent.pagoRealizado &&
            !selectedStudent.validado &&
            !showConfirm && (
              <button
                className="btn-confirmar"
                style={{ display: "block", margin: "0 auto" }}
                onClick={() => setShowConfirm(true)}
              >
                Confirmar Registro
              </button>
            )}

          {showConfirm && (
            <div style={{ textAlign: "center", marginTop: "1.2rem" }}>
              <div style={{ marginBottom: "1rem", fontWeight: "bold" }}>
                ¿Seguro que quiere confirmar este usuario?
              </div>
              <button
                className="btn-confirmar"
                style={{ marginRight: "1.2rem" }}
                onClick={() => confirmarRegistro(selectedStudent._id)}
              >
                Sí
              </button>
              <button
                style={{
                  background: "#e9ecef",
                  color: "#6c757d",
                  border: "none",
                  borderRadius: "20px",
                  padding: "0.4rem 1.1rem",
                  cursor: "pointer",
                }}
                onClick={() => setShowConfirm(false)}
              >
                No
              </button>
            </div>
          )}

          <button
            style={{
              marginTop: "1.5rem",
              background: "#e9ecef",
              color: "#6c757d",
              border: "none",
              borderRadius: "20px",
              padding: "0.4rem 1.1rem",
              cursor: "pointer",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
            onClick={() => {
              setSelectedStudent(null);
              setShowConfirm(false);
              setSuccessMsg("");
            }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default SecretariaView;