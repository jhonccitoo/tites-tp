import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import { Navbar, Container, Nav } from 'react-bootstrap';

function CreateUser() {
  const navigate = useNavigate();
  // --- Estado con Hooks ---
  // Eliminar el estado de users y la función getUsers, ya no se usa
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [password, setPassword] = useState('');
  const [pagoInscripcion, setPagoInscripcion] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- Función para obtener usuarios ---
  const getUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:4000/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Could not fetch users.');
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para evitar re-creaciones innecesarias

  // --- Cargar usuarios al montar ---
  useEffect(() => {
    // No cargar usuarios
  }, []);

  // --- Manejador de cambios para inputs ---
  const onChangeInput = (e) => {
    const { name, value, type, checked } = e.target;
    switch (name) {
      case 'nombre':
        setNombre(value);
        break;
      case 'apellido':
        setApellido(value);
        break;
      case 'correoInstitucional':
        setCorreoInstitucional(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'pagoInscripcion':
        setPagoInscripcion(type === 'checkbox' ? checked : value);
        break;
      default:
        break;
    }
  };

  // --- Manejador para enviar el formulario ---
  const onSubmit = async (e) => {
    e.preventDefault();
  setIsLoading(true);
  setError(null);
  setSuccess(null);

    // Validación nombre y apellido: solo letras y tildes
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

    // Validación de pago de inscripción
    if (!pagoInscripcion) {
      setError("Para poder continuar con el registro, es necesario realizar el pago por derecho. Para más información visite https://www.urp.edu.pe/pdf/id/27737/n/tramite-del-titulo-profesional.pdf");
      setIsLoading(false);
      return;
    }

    // Validación de correo institucional: solo @urp.edu.pe
    const urpRegex = /^[^@\s]+@urp\.edu\.pe$/i;
    if (!urpRegex.test(correoInstitucional)) {
      setError("El correo institucional debe ser del dominio @urp.edu.pe.");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError("La contraseña es requerida.");
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/users', {
        nombre,
        apellido,
        correoInstitucional,
        password,
        pagoInscripcion
      });
      setNombre('');
      setApellido('');
      setCorreoInstitucional('');
      setPassword('');
      setPagoInscripcion(false);
      navigate('/', { state: { userRegistered: 'Usuario registrado correctamente' } });
    } catch (err) {
      // Solo mostrar error si es de validación de campos
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Manejador para eliminar usuario ---
  const deleteUser = async (id) => {
    // Opcional: Añadir confirmación
    // if (!window.confirm('Are you sure you want to delete this user?')) {
    //   return;
    // }
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      await getUsers(); // Recarga la lista
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- Renderizado ---
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card card-body">
            <h3>Registro de Usuario</h3>
            <form onSubmit={onSubmit}>
              {/* Nombre */}
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
              {/* Apellido */}
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
              {/* Correo Institucional */}
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
              {/* Contraseña */}
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
              {/* Pago Inscripción */}
              <div className="form-group mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="pagoInscripcion"
                    name="pagoInscripcion"
                    checked={pagoInscripcion}
                    onChange={onChangeInput}
                    disabled={isLoading}
                  />
                  <label className="form-check-label" htmlFor="pagoInscripcion">
                    ¿Ya realizó el pago de inscripción?
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100" style={{backgroundColor:'#218838',borderColor:'#218838'}} disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Registrar usuario'}
              </button>
              <button
                type="button"
                className="btn btn-outline-success w-100 mt-2"
                style={{borderColor:'#218838',color:'#218838'}} 
                onClick={async () => {
                  try {
                    const res = await axios.get('http://localhost:4000/api/drive/auth-url');
                    window.location.href = res.data.url;
                  } catch (err) {
                    alert('Error al obtener URL de Google');
                  }
                }}
              >
                Crear cuenta con Google
              </button>
              {error && <div className="alert alert-danger mt-3">{error}</div>}
            </form>
            <button className="btn btn-outline-secondary mt-3 w-100" onClick={() => navigate('/')}>Volver a Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUser;