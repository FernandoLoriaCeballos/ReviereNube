import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import logo from './assets/img/logo.png';
import moment from 'moment-timezone';

const Ofertas = () => {
  const [ofertas, setOfertas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id_producto: "",
    descuento: "",
    precio_oferta: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "true"
  });

  useEffect(() => {
    obtenerOfertas();
    obtenerProductos();
  }, []);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get("http://localhost:3000/productos");
      setProductos(response.data);
    } catch (error) {
      console.error("Error al obtener los productos:", error);
    }
  };

  const obtenerOfertas = async () => {
    try {
      const response = await axios.get("http://localhost:3000/ofertas");
      setOfertas(response.data);
    } catch (error) {
      console.error("Error al obtener las ofertas:", error);
    }
  };

  const handleEditClick = (oferta) => {
    setFormData({
      _id: oferta._id,
      id_producto: oferta.id_producto,
      descuento: oferta.descuento,
      precio_oferta: oferta.precio_oferta,
      fecha_inicio: new Date(oferta.fecha_inicio).toISOString().split('T')[0],
      fecha_fin: new Date(oferta.fecha_fin).toISOString().split('T')[0],
      estado: oferta.estado.toString()
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      id_producto: "",
      descuento: "",
      precio_oferta: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "true"
    });
    setIsEditing(false);
  };

 const handleChange = async (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));

  // Si se cambia el id_producto o el descuento, calcular el precio de oferta
  if (name === 'id_producto' || name === 'descuento') {
    if (value && formData.id_producto) {
      const producto = productos.find(p => p.id_producto === parseInt(formData.id_producto));
      if (producto) {
        const descuento = name === 'descuento' ? parseFloat(value) : parseFloat(formData.descuento);
        const precioOriginal = producto.precio;
        const precioOferta = precioOriginal - (precioOriginal * descuento / 100);
        setFormData(prev => ({
          ...prev,
          precio_oferta: precioOferta.toFixed(2)
        }));
      }
    }
  }
};

  const handleSave = async () => {
    try {
      const ofertaData = {
        id_producto: parseInt(formData.id_producto),
        descuento: parseFloat(formData.descuento),
        precio_oferta: parseFloat(formData.precio_oferta),
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
        estado: formData.estado
      };

      if (isEditing) {
        await axios.put(`http://localhost:3000/ofertas/${formData._id}`, ofertaData);
      } else {
        await axios.post("http://localhost:3000/ofertas", ofertaData);
      }

      setShowForm(false);
      obtenerOfertas();
      setFormData({
        id_producto: "",
        descuento: "",
        precio_oferta: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "true"
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar la oferta:", error);
      alert("Error al guardar la oferta. Por favor, verifica los datos.");
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      id_producto: "",
      descuento: "",
      precio_oferta: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "true"
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleDeleteClick = async (oferta) => {
    const isConfirmed = window.confirm("¿Estás seguro de que deseas eliminar esta oferta?");
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:3000/ofertas/${oferta._id}`);
        obtenerOfertas();
      } catch (error) {
        console.error("Error al eliminar la oferta:", error);
        alert("Error al eliminar la oferta");
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
            <a href="/ofertas" className="hover:text-blue-500 uppercase">OFERTAS</a>
            <a href="/cupones" className="hover:text-blue-500 uppercase">CUPONES</a>
            
          </div>
        </div>
      </nav>

      <section className="flex flex-col justify-center items-center min-h-screen bg-[#111827] py-16">
        <div className="w-full max-w-7xl px-4 mb-8 flex justify-between">
          <a
            href="/landing"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver Modo Usuario
          </a>
          <button 
            onClick={handleAgregarClick} 
            className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Agregar Oferta
          </button>
        </div>
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-[#202938] w-full sm:w-auto mb-8">
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs uppercase bg-gray-700 text-white">
              <tr>
                <th scope="col" className="px-6 py-3">ID Producto</th>
                <th scope="col" className="px-6 py-3">Producto</th>
                <th scope="col" className="px-6 py-3">Descuento</th>
                <th scope="col" className="px-6 py-3">Precio Original</th>
                <th scope="col" className="px-6 py-3">Precio Oferta</th>
                <th scope="col" className="px-6 py-3">Fecha Inicio</th>
                <th scope="col" className="px-6 py-3">Fecha Fin</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
  {ofertas.map((oferta) => {
    const producto = productos.find(p => p.id_producto === oferta.id_producto);
    return (
      <tr key={oferta._id} className="border-b border-gray-700 hover:bg-[#1e293b]">
        <td className="px-6 py-4">{oferta.id_producto}</td>
        <td className="px-6 py-4">{producto ? producto.nombre : 'Producto no encontrado'}</td>
        <td className="px-6 py-4">{oferta.descuento}%</td>
        <td className="px-6 py-4">${producto ? producto.precio : 'N/A'}</td>
        <td className="px-6 py-4">${oferta.precio_oferta}</td>
        <td className="px-6 py-4">{moment(oferta.fecha_inicio).tz('America/Mexico_City').format('DD/MM/YYYY')}</td>
        <td className="px-6 py-4">{moment(oferta.fecha_fin).tz('America/Mexico_City').format('DD/MM/YYYY')}</td>
        <td className="px-6 py-4">
          <span className={`px-2 py-1 rounded ${oferta.estado ? 'bg-green-500' : 'bg-red-500'}`}>
            {oferta.estado ? "Activa" : "Inactiva"}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleEditClick(oferta)} 
              className="bg-[#2563eb] hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded flex-shrink-0"
            >
              Editar
            </button>
            <button 
              onClick={() => handleDeleteClick(oferta)} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1.5 px-3 rounded flex-shrink-0"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden shadow-lg bg-[#202938] sm:rounded-lg w-[500px] max-w-[90%]">
            <div className="flex justify-between items-center bg-gray-700 px-6 py-3">
              <h2 className="text-lg font-semibold text-white">{isEditing ? "Editar Oferta" : "Agregar Oferta"}</h2>
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
                  <label className="block text-white text-sm font-bold mb-2">Producto</label>
                  <select
                    name="id_producto"
                    value={formData.id_producto}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    required
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map(producto => (
                      <option key={producto.id_producto} value={producto.id_producto}>
                        {producto.nombre} - ${producto.precio}
                      </option>
                    ))}
                  </select>
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
                  <label className="block text-white text-sm font-bold mb-2">Precio Oferta</label>
                  <input
                    type="number"
                    name="precio_oferta"
                    value={formData.precio_oferta}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    placeholder="Precio con descuento"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Fecha de Inicio</label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Fecha de Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-bold mb-2">Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
                    required
                  >
                    <option value="true">Activa</option>
                    <option value="false">Inactiva</option>
                  </select>
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

export default Ofertas;