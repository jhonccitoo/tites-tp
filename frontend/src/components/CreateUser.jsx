import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
//import { Navbar, Container, Nav } from 'react-bootstrap';

function CreateUser() {
  // --- Estado con Hooks ---
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // Nuevo estado para la contraseña
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // Para mostrar errores al usuario

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
    getUsers();
  }, [getUsers]); // Dependencia: getUsers

  // --- Manejador de cambios para inputs ---
  const onChangeInput = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value); // Maneja el cambio de contraseña
    }
  };

  // --- Manejador para enviar el formulario ---
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username || !password) {
        setError("Username and password are required.");
        setIsLoading(false);
        return;
    }

    try {
      // Envía username Y password al backend
      await axios.post('http://localhost:4000/api/users', {
        username: username,
        password: password, // Envía la contraseña
      });
      setUsername(''); // Limpia el campo username
      setPassword(''); // Limpia el campo password
      await getUsers(); // Recarga la lista de usuarios
    } catch (err) {
      console.error('Error creating user:', err);
      // Intenta obtener un mensaje de error más específico del backend si está disponible
      const message = err.response?.data?.message || 'Failed to create user. Username might already exist.';
      setError(message);
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
    <>
      
    <div className="row">
      <div className="col-md-4">
        <div className="card card-body">
          <h3>Create New User</h3>
          <form onSubmit={onSubmit}>
            {/* Input para Username */}
            <div className="form-group mb-2">
              <input
                type="text"
                className="form-control"
                placeholder="Username"
                name="username" // Añadido para el handler
                value={username}
                onChange={onChangeInput}
                required
                disabled={isLoading}
              />
            </div>

            {/* Input para Password (NUEVO) */}
            <div className="form-group mb-3">
              <input
                type="password" // Tipo password para ocultar caracteres
                className="form-control"
                placeholder="Password"
                name="password" // Añadido para el handler
                value={password}
                onChange={onChangeInput}
                required
                disabled={isLoading}
              />
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
              <span>{user.username}</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => deleteUser(user._id)}
                disabled={isLoading}
                title="Delete User" // Tooltip
              >
                &times; {/* Caracter 'x' para eliminar */}
              </button>
            </li>
          ))}
        </ul>
          {/* Mostrar error de carga/eliminación aquí también si lo prefieres */}
          {error && users.length > 0 && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
    </>
  );
}

export default CreateUser;