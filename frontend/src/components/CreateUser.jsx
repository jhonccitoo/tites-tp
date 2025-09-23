import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function CreateUser() {
  // --- Estado con Hooks ---
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
    if (name === 'username') setUsername(value);
    else if (name === 'password') setPassword(value);
    else if (name === 'role') setRole(value); // Maneja el cambio de role
  };

  // --- Enviar formulario ---
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
      await axios.post('http://localhost:4000/api/users', {
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
    </div>
  );
}

export default CreateUser;