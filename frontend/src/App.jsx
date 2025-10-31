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
// --- CORRECCIÓN: Eliminé la importación de RegistrarUsuarioView que no se usaba ---
import CreateNote from "./components/CreateNote";
import CreateUser from "./components/CreateUser";
import Secretaria from "./screens/secretaria-view.jsx";
import Login from "./screens/login.jsx";
import Navigation from "./components/Navigation";
import MetodologoView from "./screens/metodologo-view.jsx";
import Revisor1View from "./screens/revisor1-view.jsx";
import Revisor2View from "./screens/revisor2-view.jsx";

// --- CORRECCIÓN: Renombramos las importaciones para que no tengan el mismo nombre ---
import DashboardTesistaView from "./screens/tesista-view.jsx";
import RegistroProyectoTesistaView from "./screens/registro-proyectoTESISTA.jsx";
import Asesor from "./screens/registro-proyectoAsesor.jsx";
//------

import CoordinadorGeneralView from "./screens/coordinadorGeneral.jsx";
import DriveViewer from "./screens/DriveViewer";
import CoordinadorAcademicoView from "./screens/coordinadorAcademico.jsx";

// Componente para rutas protegidas
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

          {/* Ruta pública */}
          <Route path="/" element={<Login />} />
          <Route path="/secretaria" element={<Secretaria />} />

        {/* Rutas protegidas con Navigation */}
        <Route element={<ProtectedRoute />}>
          <Route path="/notas" element={<Noteslist />} />
          <Route path="/edit/:id" element={<CreateNote />} />
          <Route path="/create" element={<CreateNote />} />
          <Route path="/user" element={<CreateUser />} />
          <Route path="/TesistaView" element={<TesistaView />} />
          <Route path="/MetodologoView" element={<MetodologoView />} />
          <Route path="/asesor" element={<Asesor />} />
          <Route path="/coordinadorGeneral" element={<CoordinadorGeneralView />} />
          <Route path="/revisor1" element={<Revisor1View />} />
          <Route path="/revisor2" element={<Revisor2View />} />
          <Route path="/drive" element={<DriveViewer />} />
          <Route path="/coordinadorAcademico" element={<CoordinadorAcademicoView />} />
        </Route>
          {/* Rutas protegidas con Navigation */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notas" element={<Noteslist />} />
            <Route path="/edit/:id" element={<CreateNote />} />
            <Route path="/create" element={<CreateNote />} />
            <Route path="/user" element={<CreateUser />} />
            
            {/* --- CORRECCIÓN: Se asignan los componentes renombrados a rutas distintas --- */}
            <Route path="/TesistaView" element={<DashboardTesistaView />} />
            <Route path="/registro-proyecto" element={<RegistroProyectoTesistaView />} />
            
            <Route path="/MetodologoView" element={<MetodologoView />} />
            <Route path="/asesor" element={<Asesor />} />
            <Route path="/coordinadorGeneral" element={<CoordinadorGeneralView />} />
            <Route path="/revisor1" element={<Revisor1View />} />
            <Route path="/revisor2" element={<Revisor2View />} />
            <Route path="/drive" element={<DriveViewer />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
Route   </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
