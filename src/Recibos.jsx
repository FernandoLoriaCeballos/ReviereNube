import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';

function Recibos() {
  const [recibos, setRecibos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: "",
    productos: [{ id_producto: "", cantidad: "" }],
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchRecibos();
    fetchProductos();
    fetchUsuarios();
  }, []);

  const fetchRecibos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/recibos");
      setRecibos(response.data);
    } catch (error) {
      console.error("Error al obtener recibos:", error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get("http://localhost:3000/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
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

    try {
      const dataToSubmit = {
        id_usuario: parseInt(formData.id_usuario),
        productos: formData.productos.map((producto) => ({
          id_producto: parseInt(producto.id_producto),
          cantidad: parseInt(producto.cantidad),
        })),
      };

      await axios.post("http://localhost:3000/recibos", dataToSubmit);

      setFormData({ id_usuario: "", productos: [{ id_producto: "", cantidad: "" }] });
      fetchRecibos();
      setShowForm(false);
    } catch (error) {
      console.error("Error al agregar recibo:", error);
    }
  };

  const handleAgregarClick = () => {
    setFormData({ id_usuario: "", productos: [{ id_producto: "", cantidad: "" }] });
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
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
                <th scope="col" className="px-6 py-3">ID Compra</th>
                <th scope="col" className="px-6 py-3">Usuario</th>
                <th scope="col" className="px-6 py-3">Fecha Emisión</th>
                <th scope="col" className="px-6 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {recibos.map((recibo, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-[#1e293b]">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{recibo.id_compra}</td>
                  <td className="px-6 py-4">{recibo.nombre_usuario}</td>
                  <td className="px-6 py-4">{new Date(recibo.fecha_emi).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{recibo.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button onClick={handleAgregarClick} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Recibo
        </button>
      </section>

      {showForm && (
  <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
    <div className="relative overflow-hidden shadow-lg bg-[#202938] sm:rounded-lg w-[800px] max-w-[95%]">
      <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
        <h2 className="text-lg font-semibold text-white">Agregar Recibo</h2>
        <button onClick={handleCloseForm} className="text-white hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x w-6 h-6">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white text-sm font-bold mb-2">Usuario</label>
            <select
              name="id_usuario"
              value={formData.id_usuario}
              onChange={(e) => handleChange(null, e)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
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
          {formData.productos.map((producto, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <select
                  name="id_producto"
                  value={producto.id_producto}
                  onChange={(e) => handleChange(index, e)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  required
                >
                  <option value="">Selecciona un producto</option>
                  {productos.map((prod) => (
                    <option key={prod.id_producto} value={prod.id_producto}>
                      {prod.nombre}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  name="cantidad"
                  value={producto.cantidad}
                  onChange={(e) => handleChange(index, e)}
                  placeholder="Cantidad"
                  className="shadow appearance-none border rounded w-1/4 py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                  required
                />
                {index > 0 && (
                  <button type="button" onClick={() => removeProducto(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="flex justify-between">
            <button type="button" onClick={addProducto} className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Agregar Producto
            </button>
            <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
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