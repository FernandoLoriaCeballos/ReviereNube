import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import moment from "moment-timezone";
import logo from './assets/img/logo.png';

function Resenas() {
  const [resenas, setResenas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id_producto: "",
    id_usuario: "",
    calificacion: "",
    comentario: "",
    fecha: moment().tz("America/Mexico_City").format("YYYY-MM-DD"),
  });

  useEffect(() => {
    const fetchResenas = async () => {
      try {
        const response = await axios.get("http://localhost:3000/resenas");
        setResenas(response.data);
      } catch (error) {
        console.error("Error al obtener reseñas:", error);
      }
    };

    fetchResenas();
  }, []);

  const handleEditClick = (index) => {
    const selectedResena = resenas[index];
    setFormData({
      ...selectedResena,
      fecha: moment(selectedResena.fecha).tz("America/Mexico_City").format("YYYY-MM-DD"),
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      id_producto: "",
      id_usuario: "",
      calificacion: "",
      comentario: "",
      fecha: moment().tz("America/Mexico_City").format("YYYY-MM-DD"),
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/resenas/${formData._id}`, {
        ...formData,
        fecha: moment.tz(formData.fecha, "America/Mexico_City").toISOString(),
      });
      setShowForm(false);
      const response = await axios.get("http://localhost:3000/resenas");
      setResenas(response.data);
    } catch (error) {
      console.error("Error al actualizar reseña:", error);
    }
  };

  const handleAgregarClick = async () => {
    setFormData({
      id_producto: "",
      id_usuario: "",
      calificacion: "",
      comentario: "",
      fecha: moment().tz("America/Mexico_City").format("YYYY-MM-DD"),
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleAddResena = async () => {
    try {
      await axios.post("http://localhost:3000/resenas", {
        ...formData,
        fecha: moment.tz(formData.fecha, "America/Mexico_City").toISOString(),
      });
      setShowForm(false);
      const response = await axios.get("http://localhost:3000/resenas");
      setResenas(response.data);
    } catch (error) {
      console.error("Error al agregar reseña:", error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/resenas/${id}`);
      setResenas(resenas.filter((resena) => resena._id !== id));
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
    }
  };

  return (
    <div className="bg-[#111827] font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      <nav className="bg-[#111827] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/HomeAdmin" className="flex items-center">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/usuarios" className="hover:text-blue-500 uppercase">USUARIOS</a>
            <a href="/productos" className="hover:text-blue-500 uppercase">PRODUCTOS</a>
            <a href="/resenas" className="hover:text-blue-500 uppercase">RESEÑAS</a>
            <a href="/recibos" className="hover:text-blue-500 uppercase">RECIBOS</a>
            <a href="/Ofertas" className="hover:text-blue-500 uppercase">OFERTAS</a>
            <a href="/cupones" className="hover:text-blue-500 uppercase">CUPONES</a>
          </div>
        </div>
      </nav>

      <section className="flex flex-col justify-center items-center min-h-screen bg-[#111827] py-16">
      <div className="w-full max-w-7xl px-4 mb-8 flex justify-start">
          <a
            href="/landing"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver Modo Usuario
          </a>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-[#202938] w-full sm:w-auto mb-8">
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs uppercase bg-gray-700 text-white">
              <tr>
                <th scope="col" className="px-6 py-3">ID Producto</th>
                <th scope="col" className="px-6 py-3">ID Usuario</th>
                <th scope="col" className="px-6 py-3">Calificación</th>
                <th scope="col" className="px-6 py-3">Comentario</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resenas.map((resena, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-[#1e293b]">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{resena.id_producto}</td>
                  <td className="px-6 py-4">{resena.id_usuario}</td>
                  <td className="px-6 py-4">{resena.calificacion}</td>
                  <td className="px-6 py-4">{resena.comentario}</td>
                  <td className="px-6 py-4">{moment(resena.fecha).tz("America/Mexico_City").format("YYYY-MM-DD")}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleEditClick(index)} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteClick(resena._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAgregarClick} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Reseña
        </button>
      </section>

      {showForm && (
  <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
    <div className="relative shadow-lg bg-[#202938] sm:rounded-lg w-full max-w-4xl my-6">
      <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
        <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Reseña" : "Agregar Reseña"}</h2>
        <button onClick={handleCloseForm} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x w-6 h-6">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="p-6">
        <form>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="id_producto">ID Producto</label>
              <input type="text" id="id_producto" name="id_producto" value={formData.id_producto} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="ID del producto" />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="id_usuario">ID Usuario</label>
              <input type="text" id="id_usuario" name="id_usuario" value={formData.id_usuario} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="ID del usuario" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="comentario">Comentario</label>
            <textarea id="comentario" name="comentario" value={formData.comentario} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-24" placeholder="Comentario de la reseña"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="calificacion">Calificación</label>
              <input type="number" id="calificacion" name="calificacion" value={formData.calificacion} onChange={handleChange} min="0" max="5" className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="Calificación (0-5)" />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="fecha">Fecha</label>
              <input type="date" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={isEditing ? handleSave : handleAddResena} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              {isEditing ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default Resenas;