import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Cupones = () => {
  const [cupones, setCupones] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    codigo: "",
    descuento: "",
    fecha_expiracion: "",
  });

  useEffect(() => {
    obtenerCupones();
  }, []);

  const obtenerCupones = async () => {
    try {
      const response = await axios.get(`${API_URL}/cupones`);
      setCupones(response.data);
    } catch (error) {
      console.error("Error al obtener los cupones:", error);
    }
  };

  const handleEditClick = (cupon) => {
    setFormData({
      _id: cupon._id,
      codigo: cupon.codigo,
      descuento: cupon.descuento,
      fecha_expiracion: new Date(cupon.fecha_expiracion).toISOString().split('T')[0],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      codigo: "",
      descuento: "",
      fecha_expiracion: "",
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
      if (isEditing) {
        await axios.put(`${API_URL}/cupones/${formData._id}`, formData);
      } else {
        await axios.post(`${API_URL}/cupones`, formData);
      }
      setShowForm(false);
      obtenerCupones();
      setFormData({
        codigo: "",
        descuento: "",
        fecha_expiracion: "",
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar el cupón:", error);
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      codigo: "",
      descuento: "",
      fecha_expiracion: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleDeleteClick = async (_id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que deseas eliminar este cupón?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/cupones/${_id}`);
        obtenerCupones();
      } catch (error) {
        console.error("Error al eliminar cupón:", error);
      }
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
                <th scope="col" className="px-6 py-3">Código</th>
                <th scope="col" className="px-6 py-3">Descuento</th>
                <th scope="col" className="px-6 py-3">Fecha de Expiración</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map((cupon) => (
                <tr key={cupon._id} className="border-b border-gray-700 hover:bg-[#1e293b]">
                  <td className="text-center px-6 py-4 font-medium whitespace-nowrap">{cupon.codigo}</td>
                  <td className="text-center px-6 py-4">{cupon.descuento}%</td>
                  <td className="text-center px-6 py-4">{new Date(cupon.fecha_expiracion).toLocaleDateString()}</td>
                  <td className="text-center px-6 py-4 space-x-2">
                    <button onClick={() => handleEditClick(cupon)} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteClick(cupon._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAgregarClick} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Cupón
        </button>
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden shadow-lg bg-[#202938] sm:rounded-lg w-[500px] max-w-[90%]">
            <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Cupón" : "Agregar Cupón"}</h2>
              <button onClick={handleCloseForm} className="text-white hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x w-6 h-6">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Código</label>
                  <input
                    type="text"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    placeholder="Código del cupón"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Descuento (%)</label>
                  <input
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    placeholder="Porcentaje de descuento"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Fecha de Expiración</label>
                  <input
                    type="date"
                    name="fecha_expiracion"
                    value={formData.fecha_expiracion}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
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
};

export default Cupones;