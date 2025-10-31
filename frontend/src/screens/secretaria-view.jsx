import React, { useEffect, useState } from "react";
import axios from "axios";

const SecretariaView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Obtener estudiantes desde el backend o usar datos simulados si falla
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/users");
        setStudents(res.data);
      } catch (err) {
        console.error("Error cargando estudiantes:", err);
        // Datos simulados en caso de error
        setStudents([
          {
            _id: "1",
            username: "Juan Pérez",
            pagado: true,
            confirmado: false,
          },
          {
            _id: "2",
            username: "Ana López",
            pagado: false,
            confirmado: false,
          },
          {
            _id: "3",
            username: "Carlos Ruiz",
            pagado: true,
            confirmado: true,
          },
          {
            _id: "4",
            username: "Luis ramos",
            pagado: true,
            confirmado: false,
          },
          {
            _id: "5",
            username: "Juana Rodriguez",
            pagado: true,
            confirmado: true,
          },
          {
            _id: "6",
            username: "Gabriel Alejandro",
            pagado: false,
            confirmado: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Confirmar estudiante que ha pagado
  const confirmarRegistro = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/users/${id}`, {
        confirmado: true,
      });
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, confirmado: true } : s))
      );
      setShowConfirm(false);
      setSelectedStudent(null);
      window.alert("Usuario registrado");
    } catch (err) {
      console.error("Error confirmando registro:", err);
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
  if (loading) return <p style={{textAlign:'center'}}>Cargando estudiantes...</p>;

  return (
    <div className="secretaria-bg">
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <div className="secretaria-excel">
        <h1 className="secretaria-title">Lista de Tesistas</h1>
        <p className="secretaria-desc">Estudiantes y sus datos:</p>
        <table className="secretaria-table">
          <thead>
            <tr>
              <th style={{whiteSpace:'nowrap'}}>Nombre</th>
              <th style={{whiteSpace:'nowrap'}}>Email</th>
              <th style={{whiteSpace:'nowrap'}}>Teléfono</th>
              <th style={{whiteSpace:'nowrap'}}>Rol</th>
              <th style={{whiteSpace:'nowrap'}}>Estado de Pago</th>
              <th style={{whiteSpace:'nowrap'}}>Registro Confirmado</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} style={{cursor:'pointer'}} onClick={() => { setSelectedStudent(student); setShowConfirm(false); setSuccessMsg(""); }}>
                <td>{student.username}</td>
                <td>{student.email || '-'}</td>
                <td>{student.telefono || '-'}</td>
                <td>{student.role || '-'}</td>
                <td className={student.pagado ? "estado-pagado" : "estado-no-pagado"}>
                  {student.pagado ? "Pagado" : "No Pagado"}
                </td>
                <td>{student.confirmado ? "Sí" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedStudent && (
        <div className="secretaria-panel">
          <h2 style={{color:'#28a745', fontSize:'1.3rem', marginBottom:'1.5rem', textAlign:'center', width:'100%'}}>Registrar Pago</h2>
          <div style={{marginBottom:'1.2rem', textAlign:'center', width:'100%'}}>
            <div><b>Nombre:</b> {selectedStudent.username}</div>
            <div><b>Email:</b> {selectedStudent.email || '-'}</div>
            <div><b>Teléfono:</b> {selectedStudent.telefono || '-'}</div>
            <div><b>Rol:</b> {selectedStudent.role || '-'}</div>
            <div><b>Estado de Pago:</b> <span className={selectedStudent.pagado ? "estado-pagado" : "estado-no-pagado"}>{selectedStudent.pagado ? "Pagado" : "No Pagado"}</span></div>
            <div><b>Registro Confirmado:</b> {selectedStudent.confirmado ? "Sí" : "No"}</div>
          </div>
          {selectedStudent.pagado && !selectedStudent.confirmado && !showConfirm && (
            <button className="btn-confirmar" style={{display:'block', margin:'0 auto'}} onClick={() => setShowConfirm(true)}>
              Confirmar Registro
            </button>
          )}
          {showConfirm && (
            <div style={{textAlign:'center', marginTop:'1.2rem'}}>
              <div style={{marginBottom:'1rem', fontWeight:'bold'}}>¿Seguro que quiere confirmar este usuario?</div>
              <button className="btn-confirmar" style={{marginRight:'1.2rem'}} onClick={() => confirmarRegistro(selectedStudent._id)}>
                Sí
              </button>
              <button style={{background:'#e9ecef', color:'#6c757d', border:'none', borderRadius:'20px', padding:'0.4rem 1.1rem', cursor:'pointer'}} onClick={() => setShowConfirm(false)}>
                No
              </button>
            </div>
          )}
          {/* El mensaje de éxito ahora es un popup, no se muestra aquí */}
          <button style={{marginTop:'1.5rem', background:'#e9ecef', color:'#6c757d', border:'none', borderRadius:'20px', padding:'0.4rem 1.1rem', cursor:'pointer', display:'block', marginLeft:'auto', marginRight:'auto'}} onClick={() => {setSelectedStudent(null); setShowConfirm(false); setSuccessMsg("");}}>
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
};

export default SecretariaView;