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
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    categoria: "",
    foto: "",
  });

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

  const handleEditClick = (index) => {
    const selectedProducto = productos[index];
    setFormData({ ...selectedProducto, _id: selectedProducto._id });
    setIsEditing(true);
    setShowForm(true);
  };
  
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria: "",
      foto: "",
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
      await axios.put(`${API_URL}/productos/${formData._id}`, formData);
      setShowForm(false);
      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  const handleAgregarClick = async () => {
    setFormData({
      nombre: "",
      descripcion: "",
      precio: "",
      stock: "",
      categoria: "",
      foto: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleAddProducto = async () => {
    try {
      await axios.post(`${API_URL}/productos`, formData);
      setShowForm(false);
      const response = await axios.get(`${API_URL}/productos`);
      setProductos(response.data);
    } catch (error) {
      console.error("Error al agregar producto:", error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`${API_URL}/productos/${id}`);
      setProductos(productos.filter((producto) => producto._id !== id));
    } catch (error) {
      console.error("Error al eliminar producto:", error);
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
          <a href="/HomeAdmin" className="hover:text-blue-500 uppercase">Home</a>
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
                <th scope="col" className="px-6 py-3">Nombre</th>
                <th scope="col" className="px-6 py-3">Descripción</th>
                <th scope="col" className="px-6 py-3">Precio</th>
                <th scope="col" className="px-6 py-3">Stock</th>
                <th scope="col" className="px-6 py-3">Categoría</th>
                <th scope="col" className="px-6 py-3">Foto</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((producto, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-[#1e293b]">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{producto.nombre}</td>
                  <td className="px-6 py-4">{producto.descripcion}</td>
                  <td className="px-6 py-4">${producto.precio}</td>
                  <td className="px-6 py-4">{producto.stock}</td>
                  <td className="px-6 py-4">{producto.categoria}</td>
                  <td className="px-6 py-4">
                    <img src={producto.foto} alt={producto.nombre} className="w-16 h-16 object-cover" />
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleEditClick(index)} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteClick(producto._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAgregarClick} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Producto
        </button>
      </section>

      {showForm && (
  <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
    <div className="relative shadow-lg bg-[#202938] sm:rounded-lg w-full max-w-4xl my-6">
      <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
        <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Producto" : "Agregar Producto"}</h2>
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
              <label className="block text-white text-sm font-bold mb-2" htmlFor="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="Nombre del producto" />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="precio">Precio</label>
              <input type="number" id="precio" name="precio" value={formData.precio} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="Precio del producto" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 h-24" placeholder="Descripción del producto"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="stock">Stock</label>
              <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="Stock del producto" />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="categoria">Categoría</label>
              <input type="text" id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="Categoría del producto" />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-white text-sm font-bold mb-2" htmlFor="foto">Foto URL</label>
            <input type="text" id="foto" name="foto" value={formData.foto} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600" placeholder="URL de la foto del producto" />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={isEditing ? handleSave : handleAddProducto} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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