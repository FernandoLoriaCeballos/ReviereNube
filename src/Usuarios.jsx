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
    nombre: "",
    email: "",
    password: "",
    rol: "",
    empresa_id: ""
  });

  const rolActual = Cookies.get("rol");
  const empresaId = Cookies.get("id_empresa");

  const getNombreEmpresa = (id) => {
    const empresa = empresas.find(e => parseInt(e.id_empresa) === parseInt(id));
    return empresa ? empresa.nombre_empresa : "-";
  };

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const response = await axios.get(`${API_URL}/empresas`);
        setEmpresas(response.data);
      } catch (error) {
        console.error("Error al obtener empresas:", error);
      }
    };

    const fetchUsuarios = async () => {
      try {
        if (rolActual === "superadmin") {
          const [usuariosRes, empleadosRes] = await Promise.all([
            axios.get(`${API_URL}/usuarios`),
            axios.get(`${API_URL}/empleados`)
          ]);
          const usuariosCombinados = [...usuariosRes.data, ...empleadosRes.data].map(u => ({
            ...u,
            rol: u.rol || "empleado",
            empresa_id: u.empresa_id || u.id_empresa
          }));
          setUsuarios(usuariosCombinados);
        } else if (rolActual === "admin_empresa" && empresaId) {
          const response = await axios.get(`${API_URL}/empleados/empresa/${empresaId}`);
          const responseUsuarios = await axios.get(`${API_URL}/usuarios`);
          const empleadosAdmin = responseUsuarios.data.filter(u => u.empresa_id == empresaId && u.rol === "admin_empresa");
          setUsuarios([...response.data, ...empleadosAdmin]);
        }
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchEmpresas();
    fetchUsuarios();
  }, [rolActual, empresaId]);

  const handleEditClick = (index) => {
    const selectedUsuario = usuarios[index];
    setFormData({
      ...selectedUsuario,
      rol: selectedUsuario.rol || "usuario",
      empresa_id: selectedUsuario.empresa_id || empresaId
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
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
        empresa_id: rolActual === "admin_empresa" ? parseInt(empresaId) : formData.empresa_id
      };

      await axios.put(`${API_URL}/usuarios/${formData._id}`, datos);
      setShowForm(false);

      const updatedList = rolActual === "superadmin"
        ? await axios.get(`${API_URL}/usuarios`)
        : await axios.get(`${API_URL}/empleados/empresa/${empresaId}`);

      setUsuarios(updatedList.data);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const handleAgregarClick = () => {
    setFormData({
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
        empresa_id: formData.empresa_id
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
      window.location.reload(); // Para recargar lista combinada si es superadmin
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
    <div className="bg-[#111827] font-['Montserrat'] text-white min-h-screen">
      <nav className="bg-[#111827] px-4 py-4 flex justify-between items-center">
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
      </nav>

      <section className="px-4 py-6">
        <a href="/landing" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 inline-block">
          Volver Modo Usuario
        </a>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-[#202938]">
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs uppercase bg-gray-700 text-white">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Contraseña</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Fecha Registro</th>
                <th className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-[#1e293b]">
                  <td className="px-6 py-4">{usuario.nombre}</td>
                  <td className="px-6 py-4">{usuario.email}</td>
                  <td className="px-6 py-4">{usuario.password}</td>
                  <td className="px-6 py-4">{getNombreRol(usuario.rol)}</td>
                  <td className="px-6 py-4">{getNombreEmpresa(usuario.empresa_id)}</td>
                  <td className="px-6 py-4">{new Date(usuario.fecha_reg).toLocaleDateString()}</td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleEditClick(index)} className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded">Editar</button>
                    <button onClick={() => handleDeleteClick(usuario._id)} className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAgregarClick} className="mt-6 bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded">
          Agregar Usuario
        </button>
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative bg-[#202938] shadow-lg rounded-lg w-[500px] max-w-[90%]">
            <div className="bg-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Formulario Usuario</h2>
              <button onClick={handleCloseForm}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" className="w-full p-2 bg-gray-700 text-white rounded" />
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full p-2 bg-gray-700 text-white rounded" />
              <input name="password" value={formData.password} onChange={handleChange} placeholder="Contraseña" className="w-full p-2 bg-gray-700 text-white rounded" />
              <select name="rol" value={formData.rol} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded" disabled={rolActual !== "superadmin"}>
                <option value="">Selecciona un rol</option>
                {rolesDisponibles.map((rol) => (
                  <option key={rol} value={rol}>{getNombreRol(rol)}</option>
                ))}
              </select>
              {rolActual === "superadmin" && formData.rol === "admin_empresa" && (
                <select name="empresa_id" value={formData.empresa_id} onChange={handleChange} className="w-full p-2 bg-gray-700 text-white rounded">
                  <option value="">Selecciona una empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_empresa} value={empresa.id_empresa}>{empresa.nombre_empresa}</option>
                  ))}
                </select>
              )}
              <div className="flex justify-end">
                <button onClick={isEditing ? handleSave : handleAddUser} className="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded">
                  {isEditing ? "Guardar" : "Agregar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;
