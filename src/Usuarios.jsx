import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    nombre: "",
    email: "",
    password: "",
    rol: "",
    empresa_id: ""
  });

  const rolActual = Cookies.get("rol");
  const empresaId = Cookies.get("id_empresa");

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        if (rolActual === "superadmin") {
          const response = await axios.get(`${API_URL}/todos-usuarios-empleados`);
          setUsuarios(response.data);
        } else if (rolActual === "admin_empresa" && empresaId) {
          const response = await axios.get(`${API_URL}/empleados/empresa/${empresaId}`);
          setUsuarios(response.data);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    const fetchEmpresas = async () => {
      if (rolActual === "superadmin") {
        try {
          const response = await axios.get(`${API_URL}/empresas`);
          setEmpresas(response.data);
        } catch (error) {
          console.error("Error al obtener empresas:", error);
        }
      }
    };

    fetchUsuarios();
    fetchEmpresas();
  }, [rolActual, empresaId]);

  const handleEditClick = (index) => {
    const selectedUsuario = usuarios[index];
    setFormData({
      _id: selectedUsuario._id,
      nombre: selectedUsuario.nombre,
      email: selectedUsuario.email,
      password: selectedUsuario.password,
      rol: selectedUsuario.rol || "usuario",
      empresa_id: selectedUsuario.empresa_id || ""
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      _id: "",
      nombre: "",
      email: "",
      password: "",
      rol: "",
      empresa_id: ""
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
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        empresa_id: ["admin_empresa", "empleado"].includes(formData.rol) ? parseInt(formData.empresa_id) : null
      };

      await axios.put(`${API_URL}/usuarios/${formData._id}`, datos);
      setShowForm(false);

      const updatedList = rolActual === "superadmin"
        ? await axios.get(`${API_URL}/todos-usuarios-empleados`)
        : await axios.get(`${API_URL}/empleados/empresa/${empresaId}`);

      setUsuarios(updatedList.data);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      _id: "",
      nombre: "",
      email: "",
      password: "",
      rol: rolActual === "admin_empresa" ? "empleado" : "",
      empresa_id: empresaId
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleAddUser = async () => {
    try {
      const datos = {
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        rol: formData.rol,
        id_empresa: formData.empresa_id
      };

      if (rolActual === "admin_empresa") {
        await axios.post(`${API_URL}/registro/empleados-empresa`, datos, {
          headers: {
            rol: rolActual,
            empresa_id: empresaId
          }
        });
      } else if (rolActual === "superadmin") {
        await axios.post(`${API_URL}/registro/usuarios-superadmin`, datos, {
          headers: {
            rol: rolActual
          }
        });
      }

      setShowForm(false);

      const updatedList = rolActual === "superadmin"
        ? await axios.get(`${API_URL}/todos-usuarios-empleados`)
        : await axios.get(`${API_URL}/empleados/empresa/${empresaId}`);

      setUsuarios(updatedList.data);
    } catch (error) {
      console.error("Error al agregar usuario:", error);
    }
  };

  const handleDeleteClick = async (id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/usuarios/${id}`);
        setUsuarios(usuarios.filter((usuario) => usuario._id !== id));
      } catch (error) {
        console.error("Error al eliminar usuario:", error);
      }
    }
  };

  const rolesDisponibles = rolActual === "superadmin"
    ? ["superadmin", "admin_empresa", "empleado", "usuario"]
    : ["empleado"];

  const getNombreRol = (rol) => {
    switch (rol) {
      case "superadmin": return "Super Admin";
      case "admin_empresa": return "Administrador de Empresa";
      case "empleado": return "Empleado";
      case "usuario": return "Usuario";
      default: return rol;
    }
  };

  return (
    <div className="bg-gray-50 font-['Montserrat'] min-h-screen">
      {/* Navbar actualizada */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/HomeAdmin" className="flex items-center">
            <img src={logo} alt="Logo" className="w-[116px]" />
          </a>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/usuarios" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">USUARIOS</a>
            <a href="/productos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">PRODUCTOS</a>
            <a href="/resenas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RESEÑAS</a>
            <a href="/recibos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RECIBOS</a>
            <a href="/Ofertas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">OFERTAS</a>
            <a href="/cupones" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">CUPONES</a>
          </div>
        </div>
      </nav>

      <section className="flex flex-col justify-center items-center min-h-screen bg-gray-50 py-16">
        <div className="w-full max-w-7xl px-4 mb-8 flex justify-start">
          <a href="/landing" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
            Volver Modo Usuario
          </a>
        </div>

        {(rolActual === "superadmin" || (rolActual === "admin_empresa" && empresaId)) ? (
          <>
            <div className="relative overflow-x-auto shadow-xl rounded-lg bg-white w-full sm:w-auto mb-8 border border-gray-200">
              <table className="w-full text-sm text-left text-gray-800">
                <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nombre</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Contraseña</th>
                    <th className="px-6 py-4 font-semibold">Rol</th>
                    {rolActual === "superadmin" && <th className="px-6 py-4 font-semibold">Empresa</th>}
                    <th className="px-6 py-4 font-semibold">Fecha de Registro</th>
                    <th className="px-6 py-4 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{usuario.nombre}</td>
                      <td className="px-6 py-4">{usuario.email}</td>
                      <td className="px-6 py-4 font-mono text-sm">{"•".repeat(usuario.password.length)}</td>
                      <td className="px-6 py-4">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          {getNombreRol(usuario.rol)}
                        </span>
                      </td>
                      {rolActual === "superadmin" && (
                        <td className="px-6 py-4">
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                            {usuario.empresa_nombre || "Sin empresa"}
                          </span>
                        </td>
                      )}
                      <td className="px-6 py-4">{new Date(usuario.fecha_reg).toLocaleDateString()}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button 
                          onClick={() => handleEditClick(index)} 
                          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(usuario._id)} 
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
              Agregar Usuario
            </button>
          </>
        ) : (
          <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-200">
            <p className="text-gray-700 text-xl text-center">No tienes permisos para ver esta sección.</p>
          </div>
        )}
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden shadow-2xl bg-white rounded-lg w-[500px] max-w-[90%] border border-gray-200">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Usuario" : "Agregar Usuario"}</h2>
              <button onClick={handleCloseForm} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
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
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                  <select 
                    name="rol" 
                    value={formData.rol} 
                    onChange={handleChange} 
                    disabled={rolActual !== "superadmin"} 
                    className="shadow border rounded-lg w-full py-3 px-3 bg-gray-50 text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un rol</option>
                    {rolesDisponibles.map((rol) => (
                      <option key={rol} value={rol}>{getNombreRol(rol)}</option>
                    ))}
                  </select>
                </div>

                {rolActual === "superadmin" && ["admin_empresa", "empleado"].includes(formData.rol) && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Empresa</label>
                    <select 
                      name="empresa_id" 
                      value={formData.empresa_id} 
                      onChange={handleChange} 
                      className="shadow border rounded-lg w-full py-3 px-3 bg-gray-50 text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id_empresa} value={empresa.id_empresa}>
                          {empresa.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={isEditing ? handleSave : handleAddUser} 
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

export default Usuarios;