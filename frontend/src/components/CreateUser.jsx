import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateUser() {
  const navigate = useNavigate();

  // --- ESTADOS ---
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [usuario, setUsuario] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

  // --- CAMBIOS EN INPUTS ---
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setError(null);
    if (name === 'nombre') setNombre(value);
    else if (name === 'apellido') setApellido(value);
    else if (name === 'correoInstitucional') setCorreoInstitucional(value);
    else if (name === 'usuario') setUsuario(value); 
    else if (name === 'password') setPassword(value);
  };

  // --- ENVÍO DEL FORMULARIO ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/;

    if (!nombre || !regexNombre.test(nombre)) {
      setError("El nombre solo puede contener letras y tildes.");
      setIsLoading(false);
      return;
    }
    if (!apellido || !regexNombre.test(apellido)) {
      setError("El apellido solo puede contener letras y tildes.");
      setIsLoading(false);
      return;
    }
    const urpRegex = /^[^@\s]+@urp\.edu\.pe$/i;
    if (!correoInstitucional || !urpRegex.test(correoInstitucional)) {
      setError("El correo institucional debe ser del dominio @urp.edu.pe.");
      setIsLoading(false);
      return;
    }
    if (!usuario) {
      setError("El nombre de usuario es requerido.");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError("La contraseña es requerida.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/pending-users', {
        nombre,
        apellido,
        correoInstitucional,
        usuario, 
        password,
      });

      setNombre('');
      setApellido('');
      setCorreoInstitucional('');
      setUsuario('');
      setPassword('');
      setShowModal(true);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      const message =
        err.response?.data?.message ||
        'Fallo al crear usuario. Verifica que el correo o usuario no estén ya registrados.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  //ESTILOS COPIADOS DEL LOGIN 
  const style = `
    :root {
      --primary-color: #28a745;
      --secondary-color: #6c757d;
      --light-gray: #f8f9fa;
      --medium-gray: #e9ecef;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      min-height: 100vh;
      background: linear-gradient(to bottom, var(--light-gray), var(--medium-gray));
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #212529;
      padding: 1rem;
    }
    .login-card {
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
      padding: 2.5rem;
      background: #ffffff;
      width: 100%;
      max-width: 800px;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .login-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.08);
    }
    .login-title {
      color: var(--secondary-color);
      margin-bottom: 1.5rem;
      text-align: center;
      font-weight: 600;
    }
    .form-control {
      border-radius: 25px;
      padding: 0.75rem 1.25rem;
      border: 1px solid #ced4da;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }
    .form-control:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.25rem rgba(40, 167, 69, 0.25);
    }
    .btn-login {
      background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
      color: white;
      border: none;
      border-radius: 25px;
      padding: 0.75rem;
      font-weight: 500;
      width: 100%;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }
    .btn-login:hover {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      transform: translateY(-2px);
    }
    .btn-register {
      background: transparent;
      color: var(--primary-color);
      border: 2px solid var(--primary-color);
      border-radius: 25px;
      padding: 0.75rem;
      font-weight: 500;
      width: 100%;
      transition: all 0.3s ease;
      margin-top: 1rem;
    }
    .btn-register:hover {
      background: var(--primary-color);
      color: white;
      transform: translateY(-2px);
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: style }} />
      <main className="login-card" role="main">
        <h1 className="login-title">Registrar Usuario</h1>

        <div className="alert alert-info text-center" role="alert">
          Recuerda que para poder continuar con el registro, es necesario realizar el pago por derecho. Para más información revisa{" "}
          <a
            href="https://www.urp.edu.pe/pdf/id/27737/n/tramite-del-titulo-profesional.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
            este enlace
          </a>.
        </div>

        <form onSubmit={onSubmit}>
          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Nombre"
              name="nombre"
              value={nombre}
              onChange={onChangeInput}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Apellido"
              name="apellido"
              value={apellido}
              onChange={onChangeInput}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group mb-2">
            <input
              type="email"
              className="form-control"
              placeholder="Correo institucional (@urp.edu.pe)"
              name="correoInstitucional"
              value={correoInstitucional}
              onChange={onChangeInput}
              required
              disabled={isLoading}
            />
          </div>

          {/* 👇 Nuevo campo Usuario */}
          <div className="form-group mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Nombre de usuario"
              name="usuario"
              value={usuario}
              onChange={onChangeInput}
              required
              disabled={isLoading}
            />
          </div>

          <div className="form-group mb-2">
            <input
              type="password"
              className="form-control"
              placeholder="Contraseña"
              name="password"
              value={password}
              onChange={onChangeInput}
              required
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn btn-login" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Registrar usuario'}
          </button>

          <button
            type="button"
            className="btn btn-register"
            onClick={() => navigate('/')}
          >
            Volver al Login
          </button>

          {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
        </form>

        {showModal && (
        <div
            style={{
            position: 'fixed',
            inset: 0, // reemplaza top, left, width, height
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            animation: 'fadeIn 0.3s ease-in-out',
            }}
        >
            <div
            style={{
                background: '#fff',
                borderRadius: '15px',
                padding: '30px 25px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                textAlign: 'center',
                width: '90%',
                maxWidth: '420px',
                animation: 'slideUp 0.35s ease-out',
            }}
            >
            <h5 style={{ marginBottom: '15px', color: '#28a745', fontWeight: '600' }}>
                Usuario guardado correctamente
            </h5>
            <p style={{ color: '#333', marginBottom: '25px' }}>
                Espere la confirmación de Secretaría.
            </p>
            <button
                type="button"
                className="btn btn-login w-100"
                onClick={() => {
                setShowModal(false);
                navigate('/', { state: { userRegistered: true } });
                }}
            >
                Aceptar
            </button>
            </div>

            {/* Animaciones CSS dentro del mismo componente */}
            <style>
            {`
                @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
                }
                @keyframes slideUp {
                from {
                    transform: translateY(20px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
                }
            `}
            </style>
        </div>
        )}

      </main>
    </>
  );
}

export default CreateUser;
