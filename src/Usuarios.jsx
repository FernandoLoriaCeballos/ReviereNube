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
    <div className="bg-[#111827] font-['Montserrat']">
      {/* ... navbar ... */}
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
          <a href="/landing" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Volver Modo Usuario
          </a>
        </div>

        {(rolActual === "superadmin" || (rolActual === "admin_empresa" && empresaId)) ? (
          <>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-[#202938] w-full sm:w-auto mb-8">
              <table className="w-full text-sm text-left text-white">
                <thead className="text-xs uppercase bg-gray-700 text-white">
                  <tr>
                    <th className="px-6 py-3">Nombre</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Contraseña</th>
                    <th className="px-6 py-3">Rol</th>
                    {rolActual === "superadmin" && <th className="px-6 py-3">Empresa</th>}
                    <th className="px-6 py-3">Fecha de Registro</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario, index) => (
                    <tr key={index} className="border-b border-gray-700 hover:bg-[#1e293b]">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{usuario.nombre}</td>
                      <td className="px-6 py-4">{usuario.email}</td>
                      <td className="px-6 py-4">{usuario.password}</td>
                      <td className="px-6 py-4">{getNombreRol(usuario.rol)}</td>
                      {rolActual === "superadmin" && <td className="px-6 py-4">{usuario.empresa_nombre || "Sin empresa"}</td>}
                      <td className="px-6 py-4">{new Date(usuario.fecha_reg).toLocaleDateString()}</td>
                      <td className="px-6 py-4 space-x-2">
                        <button onClick={() => handleEditClick(index)} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteClick(usuario._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button onClick={handleAgregarClick} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Agregar Usuario
            </button>
          </>
        ) : (
          <p className="text-white text-xl">No tienes permisos para ver esta sección.</p>
        )}
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden shadow-lg bg-[#202938] sm:rounded-lg w-[500px] max-w-[90%]">
            <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Usuario" : "Agregar Usuario"}</h2>
              <button onClick={handleCloseForm} className="text-white hover:text-gray-200">✕</button>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Contraseña</label>
                  <input type="text" name="password" value={formData.password} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight bg-gray-700 border-gray-600 text-white" />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Rol</label>
                  <select name="rol" value={formData.rol} onChange={handleChange} disabled={rolActual !== "superadmin"} className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-white">
                    <option value="">Selecciona un rol</option>
                    {rolesDisponibles.map((rol) => (
                      <option key={rol} value={rol}>{getNombreRol(rol)}</option>
                    ))}
                  </select>
                </div>

                {rolActual === "superadmin" && ["admin_empresa", "empleado"].includes(formData.rol) && (
                  <div>
                    <label className="block text-white text-sm font-bold mb-2">Empresa</label>
                    <select name="empresa_id" value={formData.empresa_id} onChange={handleChange} className="shadow border rounded w-full py-2 px-3 bg-gray-700 text-white">
                      <option value="">Selecciona una empresa</option>
                      {empresas.map((empresa) => (
                        <option key={empresa.id_empresa} value={empresa.id_empresa}>
                          {empresa.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end">
                  <button type="button" onClick={isEditing ? handleSave : handleAddUser} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none">
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
