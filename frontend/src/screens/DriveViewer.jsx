import { useEffect, useState } from "react";
import axios from "axios";

function DriveViewer() {
  const [files, setFiles] = useState([]);
  const [formularios, setFormularios] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [modalContext, setModalContext] = useState(null);
  const [isDuplicating, setIsDuplicating] = useState(false); // nuevo estado

  const token = localStorage.getItem("googleToken");
  const asesorId = "67feb9c963919de7361d274e";

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/drive/asesor/${asesorId}`)
      .then((res) => setGrupos(res.data))
      .catch((err) => console.error("Error obteniendo grupos:", err));
  }, []);

  const getFiles = async () => {
    if (!grupoSeleccionado || !token) {
      setAlertMsg("Selecciona un grupo e inicia sesión.");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:4000/api/drive/files?folderId=${grupoSeleccionado.carpeta_grupo_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFiles(res.data);
    } catch (err) {
      console.error("Error obteniendo archivos:", err.response || err.message);
      setAlertMsg("Error al obtener los archivos del grupo.");
    }
  };

  const getFormularios = async () => {
    if (!token) {
      setAlertMsg("No tienes token válido. Inicia sesión.");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:4000/api/drive/formularios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormularios(res.data);
    } catch (err) {
      console.error("Error cargando formularios:", err.response || err.message);
      setAlertMsg("Ocurrió un error al obtener los formularios.");
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !grupoSeleccionado || !token) {
      setAlertMsg("Faltan datos para subir el archivo.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    axios
      .post(
        `http://localhost:4000/api/drive/upload?folderId=${grupoSeleccionado.carpeta_grupo_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then(() => {
        setSelectedFile(null);
        getFiles();
      })
      .catch((err) =>
        console.error("Error subiendo archivo:", err.response || err.message)
      );
  };

  const confirmDuplicarFormularios = () => {
    if (!grupoSeleccionado) {
      setAlertMsg("Selecciona un grupo antes de duplicar formularios.");
      return;
    }
    setModalContext("formularios");
    setShowModal(true);
  };

  const handleDuplicarConfirmado = async () => {
    if (!token) {
      setAlertMsg("Token no disponible.");
      return;
    }

    try {
      setIsDuplicating(true);
      const archivosADuplicar =
        modalContext === "formularios" ? formularios : [];

      if (archivosADuplicar.length === 0) {
        setAlertMsg("No hay archivos para duplicar.");
        setIsDuplicating(false);
        return;
      }

      for (const file of archivosADuplicar) {
        await axios.post(
          "http://localhost:4000/api/drive/duplicar-archivo",
          {
            fileId: file.id,
            carpetaDestinoId: grupoSeleccionado.carpeta_grupo_id,
            nombre: file.name,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setIsDuplicating(false);
      setShowModal(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } catch (err) {
      console.error("Error duplicando archivos:", err.response || err.message);
      setAlertMsg("Ocurrió un error al duplicar.");
      setIsDuplicating(false);
      setShowModal(false);
    }
  };

  const handleGrupoChange = (e) => {
    const index = parseInt(e.target.value);
    if (isNaN(index)) return;

    const grupo = grupos[index];
    setGrupoSeleccionado(grupo);
    setFiles([]);
    setFormularios([]);
  };

  return (
    <div className="container mt-4">
      <h3>Gestión de Archivos por Grupo</h3>

      {alertMsg && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          {alertMsg}
          <button type="button" className="btn-close" onClick={() => setAlertMsg("")}></button>
        </div>
      )}

      <div className="mb-3">
        <label>Selecciona un grupo:</label>
        <select
          className="form-select"
          value={
            grupoSeleccionado
              ? grupos.findIndex((g) => g._id === grupoSeleccionado._id)
              : ""
          }
          onChange={handleGrupoChange}
        >
          <option value="">-- Selecciona --</option>
          {grupos.map((grupo, index) => (
            <option key={grupo._id} value={index}>
              {grupo.grupo}
            </option>
          ))}
        </select>
      </div>

      {grupoSeleccionado && (
        <>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="form-control mb-2"
          />
          <div className="mb-3 d-flex gap-2">
            <button
              onClick={handleUpload}
              className="btn btn-success"
              disabled={!selectedFile}
            >
              Subir a {grupoSeleccionado.grupo}
            </button>

            <button onClick={getFiles} className="btn btn-outline-primary">
              Ver archivos del grupo
            </button>

            <button onClick={getFormularios} className="btn btn-outline-secondary">
              Ver Formularios
            </button>

            <button onClick={confirmDuplicarFormularios} className="btn btn-outline-warning">
              Duplicar Formularios
            </button>
          </div>

          {formularios.length > 0 && (
            <>
              <h5>Formularios disponibles:</h5>
              <ul className="list-group mb-3">
                {formularios.map((file) => (
                  <li key={file.id} className="list-group-item">
                    <strong>{file.name}</strong> ({file.mimeType})
                  </li>
                ))}
              </ul>
            </>
          )}

          <ul className="list-group">
            {files.map((file) => (
              <li key={file.id} className="list-group-item d-flex justify-content-between align-items-center">
                <span>
                  <strong>{file.name}</strong> ({file.mimeType})
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar duplicado</h5>
                {!isDuplicating && (
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                )}
              </div>
              <div className="modal-body">
                {isDuplicating ? (
                  <div className="d-flex align-items-center">
                    <div className="spinner-border text-warning me-3" role="status" />
                    <span>Duplicando archivos, por favor espera...</span>
                  </div>
                ) : (
                  <p>
                    ¿Estás seguro de que deseas duplicar{" "}
                    <strong>todos los {modalContext}</strong> a la carpeta del grupo{" "}
                    <strong>{grupoSeleccionado?.grupo}</strong>?
                  </p>
                )}
              </div>
              {!isDuplicating && (
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleDuplicarConfirmado}
                  >
                    Confirmar Duplicado
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showToast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1055 }}>
          <div className="toast show bg-success text-white">
            <div className="toast-header">
              <strong className="me-auto">Duplicación completa</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowToast(false)}></button>
            </div>
            <div className="toast-body">
              Archivos duplicados correctamente a la carpeta del grupo.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriveViewer;
