import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    foto: "", // puede ser URL o identificador
  });
  const [fotoFile, setFotoFile] = useState(null); // nuevo: archivo opcional
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // "error" o "success"

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await axios.get(`${API_URL}/productos`);
        setProductos(response.data);
      } catch (error) {
        console.error("Error al obtener productos:", error);
      }
    };

    fetchProductos();
  }, []);

  // Función de validación común
  const validarCampos = () => {
    // Limpiar alertas previas
    setAlertMessage("");
    setAlertType("");

    // Validar que todos los campos obligatorios estén completos
    const camposRequeridos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria'];
    const camposVacios = camposRequeridos.filter(campo => !formData[campo].toString().trim());
    
    if (camposVacios.length > 0) {
      const nombresCampos = {
        nombre: 'Nombre',
        descripcion: 'Descripción',
        precio: 'Precio',
        stock: 'Stock',
        categoria: 'Categoría'
      };
      
      const camposFaltantes = camposVacios.map(campo => nombresCampos[campo]).join(', ');
      setAlertMessage(`Por favor, completa los siguientes campos obligatorios: ${camposFaltantes}`);
      setAlertType("error");
      return false;
    }

    // Validación adicional para el precio
    if (parseFloat(formData.precio) <= 0) {
      setAlertMessage('El precio debe ser mayor que 0.');
      setAlertType("error");
      return false;
    }

    // Validación adicional para el stock
    if (parseInt(formData.stock) < 0) {
      setAlertMessage('El stock no puede ser negativo.');
      setAlertType("error");
      return false;
    }

    return true;
  };

  const handleEditClick = (index) => {
    const selectedProducto = productos[index];
    setFormData({ ...selectedProducto, _id: selectedProducto._id });
    setFotoFile(null); // limpiar file al editar (el backend mostrará foto previa vía formData/url)
    setIsEditing(true);
    setShowForm(true);
    setAlertMessage("");
    setAlertType("");
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      _id: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria: "",
      foto: "",
    });
    setFotoFile(null);
    setIsEditing(false);
    setAlertMessage("");
    setAlertType("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      // Si hay file, usar FormData
      if (fotoFile) {
        const fd = new FormData();
        fd.append("nombre", formData.nombre);
        fd.append("descripcion", formData.descripcion);
        fd.append("precio", formData.precio);
        fd.append("stock", formData.stock);
        fd.append("categoria", formData.categoria);
        fd.append("foto", fotoFile);

        await axios.put(`${API_URL}/productos/${formData._id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // Sin archivo, enviar JSON (o FormData con foto como texto)
        await axios.put(`${API_URL}/productos/${formData._id}`, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          stock: formData.stock,
          categoria: formData.categoria,
          foto: formData.foto,
        });
      }

      // Recargar la lista de productos
      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data);
      
      setAlertMessage('Producto actualizado exitosamente.');
      setAlertType("success");
      
      // Cerrar el modal después de un breve delay
      setTimeout(() => {
        setShowForm(false);
        setAlertMessage("");
        setAlertType("");
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      setAlertMessage("Error al actualizar el producto. Verifica los datos e intenta nuevamente.");
      setAlertType("error");
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      _id: "",
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria: "",
      foto: "",
    });
    setFotoFile(null);
    setIsEditing(false);
    setShowForm(true);
    setAlertMessage("");
    setAlertType("");
  };

  const handleAddProducto = async () => {
    if (!validarCampos()) {
      return;
    }

    try {
      if (fotoFile) {
        const fd = new FormData();
        fd.append("nombre", formData.nombre);
        fd.append("descripcion", formData.descripcion);
        fd.append("precio", formData.precio);
        fd.append("stock", formData.stock);
        fd.append("categoria", formData.categoria);
        fd.append("foto", fotoFile);

        await axios.post(`${API_URL}/productos`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/productos`, {
          nombre: formData.nombre,
          descripcion: formData.descripcion,
          precio: formData.precio,
          stock: formData.stock,
          categoria: formData.categoria,
          foto: formData.foto,
        });
      }

      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data);
      setAlertMessage('Producto agregado exitosamente.');
      setAlertType("success");
      setTimeout(() => {
        setShowForm(false);
        setAlertMessage("");
        setAlertType("");
      }, 2000);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      setAlertMessage("Error al agregar el producto. Verifica los datos e intenta nuevamente.");
      setAlertType("error");
    }
  };

  const handleDeleteClick = async (id) => {
    const isConfirmed = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/productos/${id}`);
        setProductos(productos.filter((producto) => producto._id !== id));
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        alert("Error al eliminar el producto.");
      }
    }
  };

  // Nuevo handler para input file en el modal
  const handleFotoFileChange = (e) => {
    setFotoFile(e.target.files && e.target.files[0] ? e.target.files[0] : null);
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

        <div className="relative overflow-x-auto shadow-xl rounded-lg bg-white w-full sm:w-auto mb-8 border border-gray-200">
          <table className="w-full text-sm text-left text-gray-800">
            <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Foto</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{producto.nombre}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={producto.descripcion}>
                    {producto.descripcion}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">${producto.precio}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      producto.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : producto.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {producto.foto ? (
                      <img 
                        src={producto.foto} 
                        alt={producto.nombre} 
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin foto</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button 
                      onClick={() => handleEditClick(index)} 
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(producto._id)} 
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
          Agregar Producto
        </button>
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="relative overflow-hidden shadow-2xl bg-white rounded-lg w-[600px] max-w-[90%] border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Producto" : "Agregar Producto"}</h2>
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

              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="Nombre del producto"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="precio" 
                      value={formData.precio} 
                      onChange={handleChange} 
                      step="0.01"
                      min="0"
                      className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Descripción <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="descripcion" 
                    value={formData.descripcion} 
                    onChange={handleChange} 
                    rows="3"
                    className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none" 
                    placeholder="Descripción del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Stock <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="number" 
                      name="stock" 
                      value={formData.stock} 
                      onChange={handleChange} 
                      min="0"
                      className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="Cantidad disponible"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Categoría <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      name="categoria" 
                      value={formData.categoria} 
                      onChange={handleChange} 
                      className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="Categoría del producto"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Foto (URL o archivo)</label>

                  {/* File input opcional */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoFileChange}
                    className="mb-2"
                  />

                  <div>
                    <input 
                      type="url" 
                      name="foto" 
                      value={formData.foto} 
                      onChange={handleChange} 
                      className="shadow appearance-none border rounded-lg w-full py-3 px-3 leading-tight bg-gray-50 border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                      placeholder="URL de la imagen del producto (si no subes archivo)"
                    />
                  </div>

                  {formData.foto && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 mb-1">Vista previa:</p>
                      <img 
                        src={formData.foto} 
                        alt="Vista previa del producto" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="text-sm text-gray-600 mt-4">
                  <span className="text-red-500">*</span> Campos obligatorios
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={isEditing ? handleSave : handleAddProducto} 
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

export default Productos;