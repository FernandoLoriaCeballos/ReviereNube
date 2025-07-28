import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [userId, setUserId] = useState(Cookies.get("id_usuario") || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!userId);

  const fetchCarrito = async (userId) => {
    if (userId) {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/carrito/${userId}`);
        setCarrito(response.data.productos || []);
        setCuponAplicado(response.data.cupon_aplicado || null);
      } catch (error) {
        console.error("Error al obtener el carrito:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setCarrito([]);
      setCuponAplicado(null);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const currentUserId = Cookies.get("id_usuario");
    setUserId(currentUserId);
    setIsLoggedIn(!!currentUserId);
    fetchCarrito(currentUserId);
  }, [Cookies.get("id_usuario")]);

  const actualizarCarritoEnServidor = async () => {
    if (!userId) return;

    try {
      const response = await axios.put(`${API_URL}/carrito/${userId}`, {
        productos: carrito,
        cupon_aplicado: cuponAplicado
      });

      if (response.data && response.data.productos) {
        setCarrito(response.data.productos);
      }
    } catch (error) {
      console.error("Error al actualizar el carrito en el servidor:", error);
      throw error;
    }
  };

  const agregarAlCarrito = async (producto) => {
    if (!userId) return;

    try {
      const productoParaCarrito = {
        id_producto: producto.id_producto || producto.id,
        cantidad: 1,
        nombre: producto.nombre,
        precio: producto.precioOferta || producto.precio,
        foto: producto.foto || producto.imagen,
        esPromocion: !!producto.precioOferta
      };

      const response = await axios.post(`${API_URL}/carrito/${userId}`, productoParaCarrito);
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      throw error;
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    if (!userId) return;

    try {
      const response = await axios.delete(`${API_URL}/carrito/${userId}/${id_producto}`);
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
      throw error;
    }
  };

  const cambiarCantidad = async (id_producto, cantidad) => {
    if (!userId) return;

    try {
      const response = await axios.put(`${API_URL}/carrito/${userId}/${id_producto}`, {
        cantidad
      });
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al cambiar la cantidad:", error);
      throw error;
    }
  };

  const vaciarCarrito = async () => {
    if (!userId) return;

    try {
      await axios.put(`${API_URL}/carrito/${userId}`, {
        productos: [],
        cupon_aplicado: null
      });
      setCarrito([]);
      setCuponAplicado(null);
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      throw error;
    }
  };

  const aplicarCupon = async (codigo) => {
    if (!userId) return null;

    try {
      const response = await axios.post(`${API_URL}/carrito/${userId}/aplicar-cupon`, { codigo });

      if (response.data && response.data.cupon) {
        const cupon = response.data.cupon;
        setCuponAplicado(cupon);
        await actualizarCarritoEnServidor();
        return cupon;
      } else {
        throw new Error('Cupón inválido');
      }
    } catch (error) {
      console.error("Error al aplicar el cupón:", error);
      setCuponAplicado(null);
      throw error;
    }
  };

  return (
    <CarritoContext.Provider value={{
      carrito,
      cuponAplicado,
      isLoggedIn,
      setIsLoggedIn,
      userId,
      setUserId,
      isLoading,
      agregarAlCarrito,
      eliminarDelCarrito,
      cambiarCantidad,
      vaciarCarrito,
      aplicarCupon
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoProvider;