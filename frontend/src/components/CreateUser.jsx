import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateUser() {
  const navigate = useNavigate();
  // --- Estado con Hooks ---
  // Eliminar el estado de users y la función getUsers, ya no se usa
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [password, setPassword] = useState('');
  // Eliminado pagoInscripcion
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('secretaria'); // Nuevo campo role con valor por defecto
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, []);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // --- Manejador para cambios en inputs ---
  const onChangeInput = (e) => {
    const { name, value } = e.target;
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
      default:
        break;
    }
  };
  // --- Manejador para enviar el formulario ---
    if (name === 'username') setUsername(value);
    else if (name === 'password') setPassword(value);
    else if (name === 'role') setRole(value); // Maneja el cambio de role
  };

  // --- Enviar formulario ---
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

    // Validación de correo institucional: solo @urp.edu.pe
    const urpRegex = /^[^@\s]+@urp\.edu\.pe$/i;
    if (!urpRegex.test(correoInstitucional)) {
      setError("El correo institucional debe ser del dominio @urp.edu.pe.");
      setIsLoading(false);
      return;
    }
    if (!password) {
      setError("La contraseña es requerida.");
    if (!username || !password) {
      setError("Username and password are required.");
      setIsLoading(false);
      return;
    }

    // Si todas las validaciones pasan, mostrar el modal
    setShowModal(true);

    try {
      await axios.post('http://localhost:4000/api/users', {
        nombre,
        apellido,
        correoInstitucional,
        password
      });
      setNombre('');
      setApellido('');
      setCorreoInstitucional('');
      setPassword('');
      setShowModal(true);
    } catch (err) {
      // Solo mostrar error si es de validación de campos
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      }
        username,
        password,
        role, // Enviar también el rol
      });
      setUsername('');
      setPassword('');
      setRole('secretaria'); // Reset al valor por defecto
      await getUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      const message = err.response?.data?.message || 'Failed to create user. Username might already exist.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Eliminar usuario ---
  const deleteUser = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:4000/api/users/${id}`);
      await getUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renderizado ---
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef();

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card card-body">
            <h3>Registrar Usuarios</h3>
            <div className="alert alert-info" role="alert">
              Recuerda que para poder continuar con el registro, es necesario realizar el pago por derecho. Para más información revise <a href="https://www.urp.edu.pe/pdf/id/27737/n/tramite-del-titulo-profesional.pdf" target="_blank" rel="noopener noreferrer">este enlace</a>.
            </div>
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
  // --- Render ---
  return (
    <div className="row">
      <div className="col-md-4">
        <div className="card card-body">
          <h3>Create New User</h3>
          <form onSubmit={onSubmit}>
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                name="username"
                value={username}
                onChange={onChangeInput}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group mb-2">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChangeInput}
                required
                disabled={isLoading}
              />
            </div>

            {/* Nuevo campo: Rol */}
            <div className="form-group mb-3">
              <select
                className="form-control"
                name="role"
                value={role}
                onChange={onChangeInput}
                disabled={isLoading}
              >
                <option value="secretaria">Secretaria</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save User'}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="col-md-8">
        <h3>User List</h3>
        {isLoading && users.length === 0 && <p>Loading users...</p>}
        {!isLoading && users.length === 0 && !error && <p>No users found.</p>}
        <ul className="list-group">
          {users.map((user) => (
            <li
              className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
              key={user._id}
            >
              <span>
                {user.username} <strong>({user.role})</strong>
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteUser(user._id)}
                disabled={isLoading}
                title="Delete User"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
        {error && users.length > 0 && <div className="alert alert-danger mt-3">{error}</div>}
      </div>

      {/* Modal React nativo */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            maxWidth: 400,
            width: '90vw',
            padding: '0',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #dee2e6',
              padding: '1rem 1.5rem 1rem 1.5rem',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
            }}>
              <h5 style={{margin: 0, fontWeight: 600}}>Usuario guardado correctamente</h5>
              <button type="button" aria-label="Close" onClick={() => setShowModal(false)} style={{background: 'none', border: 'none', fontSize: '1.5rem', lineHeight: 1, color: '#333', cursor: 'pointer'}}>
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div style={{padding: '1.5rem', fontSize: '1rem'}}>
              Espere la confirmación de Secretaría.
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              borderTop: '1px solid #dee2e6',
              padding: '0.75rem 1.5rem',
              borderBottomLeftRadius: '8px',
              borderBottomRightRadius: '8px',
            }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateUser;