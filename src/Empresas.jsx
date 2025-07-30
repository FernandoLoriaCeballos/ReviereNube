import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    nombre_empresa: "",
    email: "",
    password: "",
    descripcion: "",
    telefono: "",
    logo: ""
  });

  const rolActual = Cookies.get("rol");

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        if (rolActual === "superadmin") {
          const response = await axios.get(`${API_URL}/empresas`);
          setEmpresas(response.data);
        }
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    fetchEmpresas();
  }, [rolActual]);

  const handleEditClick = (index) => {
    const selectedEmpresa = empresas[index];
    setFormData({
      _id: selectedEmpresa._id,
      nombre_empresa: selectedEmpresa.nombre_empresa,
      email: selectedEmpresa.email,
      password: selectedEmpresa.password,
      descripcion: selectedEmpresa.descripcion,
      telefono: selectedEmpresa.telefono,
      logo: selectedEmpresa.logo
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      _id: "",
      nombre_empresa: "",
      email: "",
      password: "",
      descripcion: "",
      telefono: "",
      logo: ""
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
      const datos = {
        nombre_empresa: formData.nombre_empresa,
        email: formData.email,
        password: formData.password,
        descripcion: formData.descripcion,
        telefono: formData.telefono,
        logo: formData.logo
      };

      await axios.put(`${API_URL}/empresas/${formData._id}`, datos);
      setShowForm(false);

      // Recargar la lista de empresas
      const updatedList = await axios.get(`${API_URL}/empresas`);
      setEmpresas(updatedList.data);
    } catch (error) {
      console.error("Error al actualizar empresa:", error);
      alert("Error al actualizar la empresa. Verifica los datos e intenta nuevamente.");
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      _id: "",
      nombre_empresa: "",
      email: "",
      password: "",
      descripcion: "",
      telefono: "",
      logo: ""
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleAddEmpresa = async () => {
    try {
      const datos = {
        nombre_empresa: formData.nombre_empresa,
        email: formData.email,
        password: formData.password,
        descripcion: formData.descripcion,
        telefono: formData.telefono,
        logo: formData.logo
      };

      await axios.post(`${API_URL}/empresas`, datos);
      setShowForm(false);

      // Recargar la lista de empresas
      const updatedList = await axios.get(`${API_URL}/empresas`);
      setEmpresas(updatedList.data);
    } catch (error) {
      console.error("Error al agregar empresa:", error);
      alert("Error al agregar la empresa. Verifica los datos e intenta nuevamente.");
    }
  };

  const handleDeleteClick = async (id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que deseas eliminar esta empresa?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/empresas/${id}`);
        setEmpresas(empresas.filter((empresa) => empresa._id !== id));
      } catch (error) {
        console.error("Error al eliminar empresa:", error);
        alert("Error al eliminar la empresa.");
      }
    }
  };

  return (
    <div className="bg-gray-50 font-['Montserrat'] min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/HomeAdmin" className="flex items-center">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/usuarios" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">USUARIOS</a>
            <a href="/productos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">PRODUCTOS</a>
            <a href="/empresas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">EMPRESAS</a>
            <a href="/recibos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RECIBOS</a>
          </div>
        </div>
      </nav>

      <section className="flex flex-col justify-center items-center min-h-screen bg-gray-50 py-16">
        <div className="w-full max-w-7xl px-4 mb-8 flex justify-start">
          <a href="/landing" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
            Volver Modo Usuario
          </a>
        </div>

        {rolActual === "superadmin" ? (
          <>
            <div className="relative overflow-x-auto shadow-xl rounded-lg bg-white w-full sm:w-auto mb-8 border border-gray-200">
              <table className="w-full text-sm text-left text-gray-800">
                <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">ID Empresa</th>
                    <th className="px-6 py-4 font-semibold">Logo</th>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Contraseña</th>
                    <th className="px-6 py-4 font-semibold">Descripción</th>
                    <th className="px-6 py-4 font-semibold">Teléfono</th>
                    <th className="px-6 py-4 font-semibold">Fecha de Creación</th>
                    <th className="px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empresas.map((empresa, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {empresa.id_empresa}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {empresa.logo ? (
                          <img 
                            src={empresa.logo} 
                            alt={`Logo ${empresa.nombre_empresa}`} 
                            className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Sin logo</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{empresa.nombre_empresa}</td>
                      <td className="px-6 py-4">{empresa.email}</td>
                      <td className="px-6 py-4 font-mono text-sm">{"•".repeat(empresa.password.length)}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={empresa.descripcion}>
                        {empresa.descripcion}
                      </td>
                      <td className="px-6 py-4">{empresa.telefono}</td>
                      <td className="px-6 py-4">{new Date(empresa.fecha_creacion).toLocaleDateString()}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button 
                          onClick={() => handleEditClick(index)} 
                          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(empresa._id)} 
                          className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={handleAgregarClick} 
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              Agregar Empresa
            </button>
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-200">
            <p className="text-gray-700 text-xl text-center">No tienes permisos para ver esta sección.</p>
            <p className="text-gray-500 text-sm text-center mt-2">Solo los Super Administradores pueden gestionar empresas.</p>
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative overflow-hidden shadow-2xl bg-white rounded-lg w-[600px] max-w-[90%] border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Empresa" : "Agregar Empresa"}</h2>
              <button onClick={handleCloseForm} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de la Empresa</label>
                  <input 
                    type="text" 
                    name="nombre_empresa" 
                    value={formData.nombre_empresa} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Ingresa el nombre de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Ingresa el email de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                  <input 
                    type="text" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Ingresa la contraseña"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                  <textarea 
                    name="descripcion" 
                    value={formData.descripcion} 
                    onChange={handleChange} 
                    rows="3"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                    placeholder="Ingresa la descripción de la empresa"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                  <input 
                    type="tel" 
                    name="telefono" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Ingresa el teléfono"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Logo (URL)</label>
                  <input 
                    type="url" 
                    name="logo" 
                    value={formData.logo} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                    placeholder="Ingresa la URL del logo"
                  />
                  {formData.logo && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                      <img 
                        src={formData.logo} 
                        alt="Vista previa del logo" 
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={isEditing ? handleSave : handleAddEmpresa} 
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none transition-all duration-300 transform hover:scale-105 shadow-md"
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
}

export default Empresas;