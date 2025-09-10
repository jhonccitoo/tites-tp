import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";



function CreateNote() {
  const loggedInUserRole = localStorage.getItem('userRole') || "";
  const [state, setState] = useState({
    users: loggedInUserRole ? [loggedInUserRole] : [], // Inicializar users con el rol logueado
    userSelected: loggedInUserRole, // Inicializar userSelected con el rol logueado
    title: "",
    content: "",
    date: new Date(),
    editing: false,
    _id: "",
    approvalStatus: '1',
  });
  
  const handleApprovalChange = (value) => {
    setState({ ...state, approvalStatus: value });
  };
  
  const radios = [
    { name: 'DESAPROBADO', value: '1' },
    { name: 'APROBADO', value: '2' },
  ];
  const { id } = useParams(); // Extrae el ID de la URL (ej: /notes/123 → id = "123")

  useEffect(() => {
    const fetchData = async () => {
      // ... (tu código existente para obtener usuarios)
  
      if (id) {
        const resNote = await axios.get(
          `http://localhost:4000/api/notes/${id}`
        );
        setState((prev) => ({
          ...prev,
          title: resNote.data.title,
          content: resNote.data.content,
          date: new Date(resNote.data.date),
          userSelected: resNote.data.author,
          editing: true,
          _id: id,
          approvalStatus: resNote.data.approvalStatus || '1', // Cargar el estado de aprobación
        }));
      }
    };

    fetchData();
  }, [id]); // Se ejecuta cada vez que `id` cambia

  const onSubmit = async (e) => {
    e.preventDefault();
    const newNote = {
      title: state.title,
      content: state.content,
      date: state.date,
      author: state.userSelected,
      approvalStatus: state.approvalStatus, // Incluye el estado de aprobación
    };

    if (state.editing) {
      await axios.put(`http://localhost:4000/api/notes/${state._id}`, newNote);
    } else {
      await axios.post("http://localhost:4000/api/notes", newNote);
    }

    window.location.href = "/notas";
  };

  const onInputChange = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const onChangeDate = (date) => {
    setState({ ...state, date });
  };

  return (
    <div className="col-md-6 offset-md-3">
      <div className="card card-body">
        <h4>{state.editing ? "Edit Note" : "Create a Note"}</h4>

        <div className="form-group mb-3">
          <select
            className="form-control"
            name="userSelected"
            onChange={onInputChange}
            value={state.userSelected}
          >
            {state.users.map((user) => (
              <option key={user} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            name="title"
            onChange={onInputChange}
            value={state.title}
            required
          />
        </div>

        <div className="form-group mb-3">
          <textarea
            name="content"
            className="form-control"
            placeholder="Content"
            onChange={onInputChange}
            value={state.content}
            required
          ></textarea>
        </div>

        <div className="form-group mb-3">
          <DatePicker
            className="form-control"
            selected={state.date}
            onChange={onChangeDate}
          />
        </div>

        <div className="form-group">
        <label>Estado de Aprobación:</label>
        <ButtonGroup>
          {radios.map((radio, idx) => (
            <ToggleButton
              key={idx}
              id={`radio-${radio.value}`}
              type="radio"
              variant={radio.value === '2' ? "outline-success" : "outline-danger"}
              name="approvalStatus"
              value={radio.value}
              checked={state.approvalStatus === radio.value}
              onChange={(e) => handleApprovalChange(e.currentTarget.value)}
            >
              {radio.name}
            </ToggleButton>
          ))}
        </ButtonGroup>
      </div>

        <form onSubmit={onSubmit}>
          <button type="submit" className="btn btn-primary">
            Save
          </button>
        </form>
      </div>
    </div>
       
  );
}

export default CreateNote;
