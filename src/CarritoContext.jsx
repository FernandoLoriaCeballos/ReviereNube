import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
  const [carrito, setCarrito] = useState([]);
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCarrito = async (userId) => {
    if (userId) {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://localhost:3000/carrito/${userId}`);
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
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCarrito(userId);
    }
  }, [userId]);

  const actualizarCarritoEnServidor = async () => {
    if (userId) {
      try {
        await axios.put(`http://localhost:3000/carrito/${userId}`, {
          productos: carrito,
          cupon_aplicado: cuponAplicado
        });
      } catch (error) {
        console.error("Error al actualizar el carrito en el servidor:", error);
      }
    }
  };

  const agregarAlCarrito = async (producto) => {
    if (!userId) return;

    try {
      const productoParaCarrito = {
        id_producto: producto.id_producto || producto.id, // Maneja ambos casos
        cantidad: 1,
        nombre: producto.nombre,
        precio: producto.precioOferta || producto.precio, // Usa el precio de oferta si existe
        foto: producto.foto || producto.imagen, // Maneja ambos casos de la URL de la imagen
        esPromocion: !!producto.precioOferta // Marca como promoción si tiene precio de oferta
      };

      const response = await axios.post(`http://localhost:3000/carrito/${userId}`, productoParaCarrito);
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
    }
  };

  const eliminarDelCarrito = async (id_producto) => {
    if (!userId) return;

    try {
      const response = await axios.delete(`http://localhost:3000/carrito/${userId}/${id_producto}`);
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
    }
  };

  const cambiarCantidad = async (id_producto, cantidad) => {
    if (!userId) return;

    try {
      const response = await axios.put(`http://localhost:3000/carrito/${userId}/${id_producto}`, {
        cantidad
      });
      setCarrito(response.data.productos);
    } catch (error) {
      console.error("Error al cambiar la cantidad:", error);
    }
  };

  const vaciarCarrito = async () => {
    if (!userId) return;
  
    try {
      await axios.put(`http://localhost:3000/carrito/${userId}`, { 
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
      const response = await axios.post(`http://localhost:3000/carrito/${userId}/aplicar-cupon`, { 
        codigo 
      });
      const cupon = response.data.cupon;
      setCuponAplicado(cupon);
      await actualizarCarritoEnServidor();
      return cupon;
    } catch (error) {
      console.error("Error al aplicar el cupón:", error);
      setCuponAplicado(null);
      return null;
    }
  };

  return (
    <CarritoContext.Provider value={{
      carrito,
      cuponAplicado,
      agregarAlCarrito,
      eliminarDelCarrito,
      cambiarCantidad,
      vaciarCarrito,
      aplicarCupon,
      isLoading
    }}>
      {children}
    </CarritoContext.Provider>
  );
};

export default CarritoProvider;