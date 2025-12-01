import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "tailwindcss/tailwind.css";

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
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); 

  // --- OBTENCIÓN DE CREDENCIALES ---
  const rolActual = Cookies.get("rol");
  const emailUsuarioActual = Cookies.get("email");
  // Intentamos obtener el ID de la empresa de varias formas posibles
  const idEmpresaUsuario = Cookies.get("empresa_id") || Cookies.get("id_empresa") || localStorage.getItem("empresa_id");

  useEffect(() => {
    fetchEmpresas();
  }, []);

  const fetchEmpresas = async () => {
    try {
      const response = await axios.get(`${API_URL}/empresas`);
      const data = Array.isArray(response.data) ? response.data : [];
      setEmpresas(data);
      
      // DEBUG: Ver en consola qué está detectando
      console.log("--- DEBUG FILTRO ---");
      console.log("Rol:", rolActual);
      console.log("ID Empresa Usuario:", idEmpresaUsuario);
      console.log("Total Empresas:", data.length);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
    }
  };

  // --- LÓGICA DE FILTRADO ROBUSTA ---
  const getEmpresasVisibles = () => {
    // 1. Superadmin ve todo
    if (rolActual === "superadmin") {
      return empresas;
    }

    // 2. ESTRATEGIA A: Filtrar por ID (La más segura para Admin de Empresa)
    if (idEmpresaUsuario) {
      const idBuscado = parseInt(idEmpresaUsuario);
      
      // Buscamos la empresa "Madre" usando el ID
      const miEmpresaMadre = empresas.find(e => e.id_empresa === idBuscado);

      if (miEmpresaMadre) {
        const nombreRaiz = miEmpresaMadre.nombre_empresa.trim().toLowerCase();
        
        return empresas.filter(e => {
          // A) Es la empresa madre (coincide ID)
          if (e.id_empresa === idBuscado) return true;
          
          // B) Es una sucursal (su nombre contiene el nombre de la madre)
          // Ej: Madre="BDN", Sucursal="BDN - Norte" -> Coincide
          if (e.nombre_empresa.toLowerCase().includes(nombreRaiz)) return true;

          return false;
        });
      }
    }

    // 3. ESTRATEGIA B: Filtrar por Email (Respaldo si no hay ID)
    if (emailUsuarioActual) {
      const emailLimpio = emailUsuarioActual.trim().toLowerCase();
      
      // Buscamos si existe alguna empresa con este email exacto
      const empresaPorEmail = empresas.find(e => e.email && e.email.toLowerCase() === emailLimpio);
      
      if (empresaPorEmail) {
        const nombreRaiz = empresaPorEmail.nombre_empresa.trim().toLowerCase();
        return empresas.filter(e => 
          (e.email && e.email.toLowerCase() === emailLimpio) || 
          e.nombre_empresa.toLowerCase().includes(nombreRaiz)
        );
      }
      
      // Si no encontramos empresa madre, devolvemos solo coincidencias exactas de email
      return empresas.filter(e => e.email && e.email.toLowerCase() === emailLimpio);
    }

    return [];
  };

  const empresasVisibles = getEmpresasVisibles();
  // -----------------------------------------------------

  // --- FUNCIONES AUXILIARES (Pre-llenado) ---
  const getNombreEmpresaRaiz = () => {
    // Intenta obtener el nombre de la empresa principal para pre-llenar el formulario
    if (idEmpresaUsuario) {
      const madre = empresas.find(e => e.id_empresa === parseInt(idEmpresaUsuario));
      if (madre) return madre.nombre_empresa;
    }
    if (emailUsuarioActual) {
       const madre = empresas.find(e => e.email && e.email.toLowerCase() === emailUsuarioActual.toLowerCase());
       if (madre) return madre.nombre_empresa;
    }
    return "";
  };
  // ------------------------------------------

  const validarCampos = () => {
    setAlertMessage("");
    setAlertType("");
    const camposRequeridos = ['nombre_empresa', 'email', 'password', 'descripcion', 'telefono'];
    const camposVacios = camposRequeridos.filter(campo => !formData[campo].trim());
    
    if (camposVacios.length > 0) {
      setAlertMessage(`Por favor completa todos los campos obligatorios.`);
      setAlertType("error");
      return false;
    }
    return true;
  };

  const handleEditClick = (id) => {
    const selected = empresas.find(e => e._id === id);
    if (selected) {
        setFormData({ ...selected });
        setIsEditing(true);
        setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ _id: "", nombre_empresa: "", email: "", password: "", descripcion: "", telefono: "", logo: "" });
    setIsEditing(false);
    setAlertMessage("");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!validarCampos()) return;
    try {
      await axios.put(`${API_URL}/empresas/${formData._id}`, formData);
      await fetchEmpresas();
      setAlertMessage('Actualizado exitosamente.');
      setAlertType("success");
      setTimeout(() => setShowForm(false), 1500);
    } catch (error) {
      setAlertMessage("Error al actualizar.");
      setAlertType("error");
    }
  };

  const handleAgregarClick = () => {
    let nombreInicial = "";
    
    // Pre-llenado inteligente
    if (rolActual !== "superadmin") {
      const nombreRaiz = getNombreEmpresaRaiz();
      if (nombreRaiz) {
        nombreInicial = `${nombreRaiz} - `;
      }
    }

    setFormData({
      _id: "",
      nombre_empresa: nombreInicial,
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
    if (!validarCampos()) return;

    let datosFinales = { ...formData };

    // Validar nombre de sucursal
    if (rolActual !== "superadmin") {
       const nombreRaiz = getNombreEmpresaRaiz();
       if (nombreRaiz) {
          // Si el usuario borró el prefijo, lo volvemos a poner para no perder la vinculación visual
          if (!datosFinales.nombre_empresa.toLowerCase().includes(nombreRaiz.toLowerCase())) {
             datosFinales.nombre_empresa = `${nombreRaiz} - ${datosFinales.nombre_empresa}`;
          }
       }
    }

    try {
      await axios.post(`${API_URL}/empresas`, datosFinales);
      await fetchEmpresas();
      setAlertMessage('Sucursal agregada exitosamente.');
      setAlertType("success");
      setTimeout(() => setShowForm(false), 1500);
    } catch (error) {
      setAlertMessage("Error al agregar.");
      setAlertType("error");
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta sucursal?")) {
      try {
        await axios.delete(`${API_URL}/empresas/${id}`);
        fetchEmpresas();
      } catch (error) {
        alert("Error al eliminar.");
      }
    }
  };

  return (
    <div className="bg-gray-50 font-['Montserrat'] min-h-screen">
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/HomeAdmin" className="flex items-center"></a>
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/homeadmin" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">DASHBOARD</a>
            <a href="/usuarios" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">USUARIOS</a>
            <a href="/productos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">PRODUCTOS</a>
            <a href="/empresas" className="text-red-500 hover:text-red-500 transition duration-300 uppercase font-medium font-bold">SUCURSALES</a>
            <a href="/sucursales" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">INVENTARIO(S)</a>
            <a href="/recibos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RECIBOS</a>
            <a href="/reporte-ventas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">REPORTE DE VENTAS</a>
          </div>
        </div>
      </nav>

      <section className="flex flex-col justify-center items-center min-h-screen bg-gray-50 py-16">
        <div className="w-full max-w-7xl px-4 mb-8 flex justify-start">
          <a href="/landing" className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
            Volver Modo Usuario
          </a>
        </div>

        <div className="relative overflow-x-auto shadow-xl rounded-lg bg-white w-full mb-8 border border-gray-200">
          <table className="w-full min-w-max text-sm text-left text-gray-800">
            <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">ID Sucursal</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Logo</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Nombre</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Email</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Contraseña</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Descripción</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Teléfono</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Fecha de Creación</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresasVisibles.length > 0 ? (
                empresasVisibles.map((empresa, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {empresa.id_empresa}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {empresa.logo ? (
                        <img 
                          src={empresa.logo.startsWith('http') ? empresa.logo : `${API_URL}/uploads/companies/${empresa.logo}`} 
                          alt="Logo" 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                          onError={(e) => {e.target.style.display='none'}}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">Sin logo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{empresa.nombre_empresa}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{empresa.email}</td>
                    <td className="px-6 py-4 font-mono text-sm whitespace-nowrap">••••••</td>
                    <td className="px-6 py-4 max-w-xs truncate">{empresa.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{empresa.telefono}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{empresa.fecha_creacion ? new Date(empresa.fecha_creacion).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                      <button onClick={() => handleEditClick(empresa._id)} className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform">Editar</button>
                      <button onClick={() => handleDeleteClick(empresa._id)} className="bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:scale-105 transition-transform">Eliminar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                        <p className="text-lg font-medium mb-2">No se encontraron empresas asociadas.</p>
                        <p className="text-xs text-gray-400">
                            Rol detectado: {rolActual} | ID Empresa: {idEmpresaUsuario || "No detectado"}
                        </p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button 
          onClick={handleAgregarClick} 
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          Agregar Sucursal
        </button>
      </section>

      {/* MODAL */}
      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative overflow-hidden shadow-2xl bg-white rounded-lg w-[600px] max-w-[90%] border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar" : "Agregar"} Sucursal</h2>
              <button onClick={handleCloseForm} className="text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              {alertMessage && (
                <div className={`mb-4 p-4 rounded-lg border-l-4 ${alertType === "error" ? "bg-red-50 border-red-500 text-red-700" : "bg-green-50 border-green-500 text-green-700"}`}>
                  <p className="text-sm font-medium">{alertMessage}</p>
                </div>
              )}
              <form className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de la Sucursal <span className="text-red-500">*</span></label>
                  <input type="text" name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} className="border rounded-lg w-full py-3 px-3" placeholder="Ej: BDN - Norte"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Email <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="border rounded-lg w-full py-3 px-3"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña <span className="text-red-500">*</span></label>
                  <input type="text" name="password" value={formData.password} onChange={handleChange} className="border rounded-lg w-full py-3 px-3"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="border rounded-lg w-full py-3 px-3 resize-none" rows="3"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                  <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} className="border rounded-lg w-full py-3 px-3"/>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Logo (URL)</label>
                  <input type="text" name="logo" value={formData.logo} onChange={handleChange} className="border rounded-lg w-full py-3 px-3"/>
                </div>
                <div className="flex justify-end pt-4">
                  <button type="button" onClick={isEditing ? handleSave : handleAddEmpresa} className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:scale-105 transition-transform">
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