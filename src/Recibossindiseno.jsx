import React, { useState, useEffect } from 'react';
import axios from 'axios';

const xd = () => {
  const [recibos, setRecibos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    id_usuario: '',
    productos: [{ id_producto: '', cantidad: '' }],
  });

  useEffect(() => {
    fetchRecibos();
    fetchProductos();
    fetchUsuarios();
  }, []);

  const fetchRecibos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/recibos');
      setRecibos(response.data);
    } catch (error) {
      console.error('Error fetching recibos:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error fetching productos:', error);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const response = await axios.get('http://localhost:3000/usuarios');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error fetching usuarios:', error);
    }
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    if (name === 'id_usuario') {
      setFormData({ ...formData, [name]: value });
    } else {
      const newProductos = formData.productos.map((producto, i) => 
        i === index ? { ...producto, [name]: value } : producto
      );
      setFormData({ ...formData, productos: newProductos });
    }
  };

  const addProducto = () => {
    setFormData({ ...formData, productos: [...formData.productos, { id_producto: '', cantidad: '' }] });
  };

  const removeProducto = (index) => {
    const newProductos = formData.productos.filter((_, i) => i !== index);
    setFormData({ ...formData, productos: newProductos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const dataToSubmit = {
        id_usuario: parseInt(formData.id_usuario), // Convertir a número
        productos: formData.productos.map(producto => ({
          id_producto: parseInt(producto.id_producto),
          cantidad: parseInt(producto.cantidad)
        }))
      };

      await axios.post('http://localhost:3000/recibos', dataToSubmit);

      setFormData({ id_usuario: '', productos: [{ id_producto: '', cantidad: '' }] });
      fetchRecibos();
    } catch (error) {
      console.error('Error saving recibo:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/recibos/${id}`);
      fetchRecibos();
    } catch (error) {
      console.error('Error deleting recibo:', error);
    }
  };

  return (
    <div>
      <h1>Recibos</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario:</label>
          <select
            name="id_usuario"
            value={formData.id_usuario}
            onChange={(e) => handleChange(null, e)}
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
          <div key={index}>
            <select
              name="id_producto"
              value={producto.id_producto}
              onChange={(e) => handleChange(index, e)}
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
              required
            />
            {index > 0 && <button type="button" onClick={() => removeProducto(index)}>Eliminar</button>}
          </div>
        ))}
        <button type="button" onClick={addProducto}>Agregar Producto</button>
        <button type="submit">Agregar</button>
      </form>
      <ul>
        {recibos.map((recibo) => (
          <li key={recibo.id_recibo}>
            <span>ID Compra: {recibo.id_compra}</span>
            <span>Usuario: {recibo.nombre_usuario}</span>
            <span>Fecha Emisión: {new Date(recibo.fecha_emi).toLocaleDateString()}</span>
            <span>Detalle: {recibo.detalle}</span>
            <button onClick={() => handleDelete(recibo.id_recibo)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default xd;
