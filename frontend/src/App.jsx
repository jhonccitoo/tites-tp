import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Noteslist from "./components/NotesList.jsx";
import CreateNote from "./components/CreateNote";
import CreateUser from "./components/CreateUser";
import Secretaria from "./screens/secretaria-view.jsx";
import Login from "./screens/login.jsx";
import Navigation from "./components/Navigation";
import MetodologoView from "./screens/metodologo-view.jsx";
import Revisor1View from "./screens/revisor1-view.jsx";
import Revisor2View from "./screens/revisor2-view.jsx";
import DashboardTesistaView from "./screens/tesista-view.jsx";
import RegistroProyectoTesistaView from "./screens/registro-proyectoTESISTA.jsx";
import Asesor from "./screens/registro-proyectoAsesor.jsx";
import CoordinadorGeneralView from "./screens/coordinadorGeneral.jsx";
import DriveViewer from "./screens/DriveViewer";
import CoordinadorAcademicoView from "./screens/coordinadorAcademico.jsx";
import TesistaView from "./screens/tesista-view";
import RegistrarUsuarioView from "./screens/registrar-usuario.jsx"; 

// --- Componente para rutas protegidas ---
const ProtectedRoute = () => {
  const token = localStorage.getItem("googleToken");
  return token ? (
    <>
      <Navigation />
      <Outlet />
    </>
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          {/* --- Rutas públicas --- */}
          <Route path="/" element={<Login />} />
          <Route path="/secretaria" element={<Secretaria />} />
          <Route path="/registrar-usuario" element={<RegistrarUsuarioView />} /> 

          {/* --- Rutas protegidas con Navigation --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notas" element={<Noteslist />} />
            <Route path="/edit/:id" element={<CreateNote />} />
            <Route path="/create" element={<CreateNote />} />
            <Route path="/user" element={<CreateUser />} />
            <Route path="/TesistaView" element={<DashboardTesistaView />} />
            <Route path="/registro-proyecto" element={<RegistroProyectoTesistaView />} />
            <Route path="/MetodologoView" element={<MetodologoView />} />
            <Route path="/asesor" element={<Asesor />} />
            <Route path="/coordinadorGeneral" element={<CoordinadorGeneralView />} />
            <Route path="/revisor1" element={<Revisor1View />} />
            <Route path="/revisor2" element={<Revisor2View />} />
            <Route path="/drive" element={<DriveViewer />} />
            <Route path="/coordinadorAcademico" element={<CoordinadorAcademicoView />} />
          </Route>

          {/* --- Catch-all redirect --- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
