import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: "",
    productos: [{ id_producto: "", cantidad: "" }],
  });
  const [showForm, setShowForm] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" o "success"

  useEffect(() => {
    fetchRecibos();
    fetchProductos();
    fetchUsuarios();
  }, []);

  const fetchRecibos = async () => {
    try {
      const response = await axios.get(`${API_URL}/recibos`);
      setRecibos(response.data);
    } catch (error) {
      console.error("Error al obtener recibos:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  // Función de validación común
  const validarCampos = () => {
    // Limpiar alertas previas
    setAlertMessage("");
    setAlertType("");

    // Validar usuario
    if (!formData.id_usuario.trim()) {
      setAlertMessage('Por favor, selecciona un usuario.');
      setAlertType("error");
      return false;
    }

    // Validar productos
    if (formData.productos.length === 0) {
      setAlertMessage('Por favor, agrega al menos un producto.');
      setAlertType("error");
      return false;
    }

    // Validar cada producto
    for (let i = 0; i < formData.productos.length; i++) {
      const producto = formData.productos[i];
      if (!producto.id_producto || !producto.cantidad) {
        setAlertMessage(`Por favor, completa todos los campos del producto ${i + 1}.`);
        setAlertType("error");
        return false;
      }
      if (parseInt(producto.cantidad) <= 0) {
        setAlertMessage(`La cantidad del producto ${i + 1} debe ser mayor a 0.`);
        setAlertType("error");
        return false;
      }
    }

    return true;
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    if (name === "id_usuario") {
      setFormData({ ...formData, [name]: value });
    } else {
      const newProductos = formData.productos.map((producto, i) =>
        i === index ? { ...producto, [name]: value } : producto
      );
      setFormData({ ...formData, productos: newProductos });
    }
  };

  const addProducto = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { id_producto: "", cantidad: "" }],
    });
  };

  const removeProducto = (index) => {
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) {
      return; // Detener la ejecución si la validación falla
    }

    try {
      const dataToSubmit = {
        id_usuario: parseInt(formData.id_usuario),
        productos: formData.productos.map((producto) => ({
          id_producto: parseInt(producto.id_producto),
          cantidad: parseInt(producto.cantidad),
        })),
      };

      await axios.post(`${API_URL}/recibos`, dataToSubmit);

      setFormData({ id_usuario: "", productos: [{ id_producto: "", cantidad: "" }] });
      fetchRecibos();
      
      setAlertMessage('Recibo agregado exitosamente.');
      setAlertType("success");
      
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        setShowForm(false);
        setAlertMessage("");
        setAlertType("");
      }, 2000);
    } catch (error) {
      console.error("Error al agregar recibo:", error);
      setAlertMessage("Error al agregar el recibo. Verifica los datos e intenta nuevamente.");
      setAlertType("error");
    }
  };

  const handleAgregarClick = () => {
    setFormData({ id_usuario: "", productos: [{ id_producto: "", cantidad: "" }] });
    setShowForm(true);
    setAlertMessage("");
    setAlertType("");
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ id_usuario: "", productos: [{ id_producto: "", cantidad: "" }] });
    setAlertMessage("");
    setAlertType("");
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
            <a href="/empresas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">SUCURSALES</a>
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

        <div className="relative overflow-x-auto shadow-xl rounded-lg bg-white w-full sm:w-auto mb-8 border border-gray-200">
          <table className="w-full text-sm text-left text-gray-800">
            <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">ID Compra</th>
                <th className="px-6 py-4 font-semibold">Usuario</th>
                <th className="px-6 py-4 font-semibold">Fecha Emisión</th>
                <th className="px-6 py-4 font-semibold">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {recibo.id_compra}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{recibo.nombre_usuario}</td>
                  <td className="px-6 py-4">{new Date(recibo.fecha_emi).toLocaleDateString()}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={recibo.detalle}>
                    {recibo.detalle}
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
          Agregar Recibo
        </button>
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative overflow-hidden shadow-2xl bg-white rounded-lg w-[600px] max-w-[90%] border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">Agregar Recibo</h2>
              <button onClick={handleCloseForm} className="text-white hover:text-gray-200 text-2xl">✕</button>
            </div>
            <div className="p-6">
              {/* Componente de alerta personalizada */}
              {alertMessage && (
                <div className={`mb-4 p-4 rounded-lg border-l-4 ${
                  alertType === "error" 
                    ? "bg-red-50 border-red-500 text-red-700" 
                    : "bg-green-50 border-green-500 text-green-700"
                } flex items-center`}>
                  <div className="flex-shrink-0 mr-3">
                    {alertType === "error" ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alertMessage}</p>
                  </div>
                  <button 
                    onClick={() => {setAlertMessage(""); setAlertType("");}}
                    className="ml-3 flex-shrink-0 text-lg hover:opacity-70"
                  >
                    ✕
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Usuario <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="id_usuario"
                    value={formData.id_usuario}
                    onChange={(e) => handleChange(null, e)}
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((usuario) => (
                      <option key={usuario.id_usuario} value={usuario.id_usuario}>
                        {usuario.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Productos <span className="text-red-500">*</span>
                  </label>
                  {formData.productos.map((producto, index) => (
                    <div key={index} className="space-y-2 mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Producto {index + 1}</h4>
                        {index > 0 && (
                          <button 
                            type="button" 
                            onClick={() => removeProducto(index)} 
                            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-1 px-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-xs"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-600 text-xs font-medium mb-1">Producto</label>
                          <select
                            name="id_producto"
                            value={producto.id_producto}
                            onChange={(e) => handleChange(index, e)}
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 leading-tight bg-white border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            required
                          >
                            <option value="">Selecciona un producto</option>
                            {productos.map((prod) => (
                              <option key={prod.id_producto} value={prod.id_producto}>
                                {prod.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-gray-600 text-xs font-medium mb-1">Cantidad</label>
                          <input
                            type="number"
                            name="cantidad"
                            value={producto.cantidad}
                            onChange={(e) => handleChange(index, e)}
                            placeholder="Cantidad"
                            min="1"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 leading-tight bg-white border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={addProducto} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md text-sm"
                  >
                    + Agregar Producto
                  </button>
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  <span className="text-red-500">*</span> Campos obligatorios
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit" 
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg focus:outline-none transition-all duration-300 transform hover:scale-105 shadow-md"
                  >
                    Agregar Recibo
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

export default Recibos;