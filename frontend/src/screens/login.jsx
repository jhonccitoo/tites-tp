import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const Login = () => {
  const [formValidated, setFormValidated] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  // Mensaje de éxito si se acaba de registrar
  const userRegistered = location.state?.userRegistered;

  // --- NUEVO: estado que controla si Google ya validó ---
  const [isGoogleValidated, setIsGoogleValidated] = useState(false);
  const [googleValidatedMsg, setGoogleValidatedMsg] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      axios
        .post("http://localhost:4000/api/drive/auth", { code })
        .then((res) => {
          // --- INICIO DE CORRECCIÓN ---
          // Asumimos que el backend devuelve: { access_token, email, user }
          // 'user' será un objeto (truthy) si existe, o null/undefined (falsy) si no.
          const { access_token, email, user } = res.data;

          console.log("Respuesta de /api/drive/auth:", res.data);

          // CAMBIO: Comprobamos 'user' (el objeto) en lugar de 'userExists' (booleano)
          if (user) {
            // Caso 1: El usuario SÍ existe en la BD
            const googleToken = access_token;
            localStorage.setItem("googleToken", googleToken);
            console.log("Token de Google guardado:", googleToken);
            console.log(`Usuario ${email} existe. Habilitando login local.`);
            
            setIsGoogleValidated(true);
            setGoogleValidatedMsg("Autenticación con Google verificada. Ingrese sus credenciales.");

            // limpiamos la querystring (opcional)
            try {
              const cleanUrl = window.location.origin + window.location.pathname;
              window.history.replaceState({}, document.title, cleanUrl);
            } catch (e) {
              console.warn("No se pudo limpiar la URL:", e);
            }

          } else {
            // Caso 2: El usuario NO existe en la BD (user es null o undefined)
            console.log(`Usuario ${email} NO existe. Redirigiendo a /registrar-usuario.`);
            // Opcional: pasamos el email a la pág de registro
            navigate("/registrar-usuario", { state: { email: email } }); 
          }
          // --- FIN DE CORRECCIÓN ---

        })
        .catch((err) => {
          console.error("Error autenticando con Google", err);
          let errorMsg = "Error al validar con Google. Intente nuevamente.";
          if (err.response?.data?.message) {
            errorMsg = err.response.data.message;
          }
          setGoogleValidatedMsg(errorMsg);
        });
    }
  }, [navigate]); // Añadimos navigate a las dependencias de useEffect

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setLoginError("");

    if (!form.checkValidity()) {
      e.stopPropagation();
      setFormValidated(true);
    } else {
      try {
        const response = await axios.post(
          "http://localhost:4000/api/auth/login",
          formData
        );
        console.log("Datos de la respuesta (ÉXITO):", response.data); // Depuración

        if (response.data.token && response.data.user) {
          localStorage.setItem("authToken", response.data.token);
          const userRole = response.data.user.rol;
          localStorage.setItem("userRole", userRole);

          // Lógica de redirección simplificada: siempre a TesistaView
          console.log(`Login exitoso. Usuario rol: ${userRole}. Redirigiendo a /TesistaView.`);
          navigate("/TesistaView");

        } else {
          // La respuesta del backend no tiene la estructura esperada
          console.error("Respuesta del backend incompleta:", response.data);
          setLoginError("Error en los datos recibidos del servidor.");
        }
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
        let errorMessage = "Error al iniciar sesión. Inténtelo de nuevo.";
        // Intenta obtener el mensaje de error específico del backend si existe
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message; // Error de red u otro
        }
        setLoginError(errorMessage);
      }
    }
    setFormValidated(true);
  };

  // --- NO SE HA CAMBIADO NADA DEL CSS ---
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
      max-width: 400px;
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
      letter-spacing: 0.5px;
      transition: all 0.3s ease;
    }

    .btn-login:hover {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      transform: translateY(-2px);
    }

    .form-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .forgot-password {
      display: block;
      text-align: center;
      margin-top: 1rem;
      color: var(--secondary-color);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
      color: var(--primary-color);
      text-decoration: underline;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 576px) {
      .login-card {
        padding: 1.5rem;
      }
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
        <h1 className="login-title">TITES - URP</h1>
        {userRegistered && (
          <div className="alert alert-success text-center mb-3">Usuario registrado exitosamente</div>
        )}

        {/* Mostrar mensaje de validación de Google si existe */}
        {googleValidatedMsg && (
          <div className={`alert ${isGoogleValidated ? "alert-success" : "alert-danger"} text-center mb-3`}>
            {googleValidatedMsg}
          </div>
        )}
        
        {/* Mensaje de error de login local */}
        {loginError && (
            <div className="alert alert-danger text-center mb-3">
                {loginError}
            </div>
        )}

        <form
          className={formValidated ? "was-validated" : ""}
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Usuario
            </label>
            <input
              type="text"
              className="form-control"
              id="username"
              name="username"
              placeholder="Ingrese su usuario"
              required
              aria-required="true"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              disabled={!isGoogleValidated} // <-- bloqueado hasta validar con Google
            />
            <div className="invalid-feedback">Por favor ingrese su usuario</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Clave
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              placeholder="Ingrese su clave"
              required
              aria-required="true"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={!isGoogleValidated} // <-- bloqueado hasta validar con Google
            />
            <div className="invalid-feedback">Por favor ingrese su clave</div>
          </div>

          <button type="submit" className="btn btn-login w-100 mt-3" disabled={!isGoogleValidated}>
            <span className="btn-text">Ingresar</span>
            <span className="sr-only">al sistema TITES</span>
          </button>

          <button
            type="button"
            className="btn btn-register mt-3"
            onClick={async () => {
              try {
                const res = await axios.get(
                  "http://localhost:4000/api/drive/auth-url"
                );
                window.location.href = res.data.url;
              } catch (err) {
                console.error("Error al obtener URL de Google", err);
                setGoogleValidatedMsg("No se pudo iniciar el flujo de Google.");
              }
            }}
          >
            Iniciar sesión con Google
          </button>


          <button
            type="button"
            className="btn btn-register"
            onClick={() => navigate("/secretaria")}
          >
            Ir a Secretaría
          </button>

            <button
            type="button"
            className="btn btn-register"
            onClick={() => navigate("/registrar-usuario")}
          >
            Registrarse
          </button>

          <a href="#" className="forgot-password">
            ¿Olvidó su contraseña?
          </a>
        </form>
      </main>
    </>
  );
};

export default Login;