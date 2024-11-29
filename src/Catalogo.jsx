import React, { useState, useEffect } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";

function Catalogo() {
  const [catalogos, setCatalogos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    productos: []
  });

  useEffect(() => {
    fetchCatalogos();
    fetchProductos();
  }, []);

  const fetchCatalogos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/catalogo');
      setCatalogos(response.data);
    } catch (error) {
      console.error('Error al obtener catálogos', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error al obtener productos', error);
    }
  };

  const handleEditClick = (index) => {
    const selectedCatalogo = catalogos[index];
    setFormData({
      ...selectedCatalogo,
      productos: selectedCatalogo.productos.map(producto => producto._id)
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      nombre: "",
      descripcion: "",
      productos: []
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProductoChange = (e) => {
    const { options } = e.target;
    const selectedProductos = [];
    for (const option of options) {
      if (option.selected) {
        selectedProductos.push(option.value);
      }
    }
    setFormData({
      ...formData,
      productos: selectedProductos
    });
  };

  const handleSave = async () => {
    try {
      await axios.put(`http://localhost:3000/catalogo/${formData._id}`, formData);
      fetchCatalogos(); // Actualiza los catálogos después de editar
      handleCloseForm(); // Cierra el formulario después de guardar
    } catch (error) {
      console.error("Error al actualizar catálogo:", error);
    }
  };

  const handleAgregarClick = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      productos: []
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleAddCatalogo = async () => {
    try {
      await axios.post('http://localhost:3000/catalogo', formData);
      fetchCatalogos(); // Actualiza los catálogos después de agregar
      handleCloseForm(); // Cierra el formulario después de agregar
    } catch (error) {
      console.error('Error al agregar catálogo', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/catalogo/${id}`);
      setCatalogos(catalogos.filter(catalogo => catalogo._id !== id));
    } catch (error) {
      console.error('Error al eliminar catálogo', error);
    }
  };

  return (
    <div>
      {/* Barra de navegación */}
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Catálogos</span>
          </a>
          <button
            data-collapse-toggle="navbar-default"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-default"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="navbar-default">
            <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <a href="usuarios" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  Usuarios
                </a>
              </li>
              <li>
                <a href="productos" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  Productos
                </a>
              </li>
              <li>
                <a href="login" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  Inicio de Sesión
                </a>
              </li>
              <li>
                <a href="registro" className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                  Registro
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Tabla de catálogos */}
      <section className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg bg-blue-900 w-full sm:w-auto mb-8">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 text-white">Nombre</th>
                <th scope="col" className="px-6 py-3 text-white">Descripción</th>
                <th scope="col" className="px-6 py-3 text-white">Fecha</th>
                <th scope="col" className="px-6 py-3 text-white">Productos</th>
                <th scope="col" className="px-6 py-3 text-white">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {catalogos.map((catalogo, index) => (
                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{catalogo.nombre}</td>
                  <td className="px-6 py-4">{catalogo.descripcion}</td>
                  <td className="px-6 py-4">{new Date(catalogo.fecha_act).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    {catalogo.productos.map(producto => producto.nombre).join(', ')}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button onClick={() => handleEditClick(index)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                      Editar
                    </button>
                    <button onClick={() => handleDeleteClick(catalogo._id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Botón para agregar un nuevo catálogo */}
        <button onClick={handleAgregarClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Agregar Catálogo
        </button>
      </section>

      {/* Formulario para agregar o editar catálogo */}
      {showForm && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50">
          <div className="relative overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-800 sm:rounded-lg w-full sm:w-auto">
            <div className="flex justify-between items-center bg-gray-300 dark:bg-gray-700 px-6 py-3">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{isEditing ? "Editar Catálogo" : "Agregar Catálogo"}</h2>
              <button onClick={handleCloseForm} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x w-6 h-6">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <form>
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">Nombre</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" placeholder="Nombre del catálogo" />
                </div>
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">Descripción</label>
                  <input type="text" name="descripcion" value={formData.descripcion} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200" placeholder="Descripción del catálogo" />
                </div>
                <div className="mb-4">
                  <label className="block text-white text-sm font-bold mb-2">Productos</label>
                  <select multiple={true} value={formData.productos} onChange={handleProductoChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200">
                    {productos.map(producto => (
                      <option key={producto._id} value={producto._id}>
                        {producto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={isEditing ? handleSave : handleAddCatalogo} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
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

export default Catalogo;
