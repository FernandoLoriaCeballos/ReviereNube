import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';


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

  // ESTADOS NUEVOS PARA MANEJAR SUSCRIPCIONES
  const [suscripcionActivaId, setSuscripcionActivaId] = useState(null);
  const [planPendienteId, setPlanPendienteId] = useState(null);
  const SUSCRIPCION_IDS = [101, 102, 103]; // IDs de ejemplo para planes


  const fetchCarrito = async (currentUserId) => {
    if (currentUserId) {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/carrito/${currentUserId}`);
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

  const actualizarCarritoEnServidor = async (productosOverride, cuponOverride) => {
    if (!userId) return;
    
    const productosAUsar = productosOverride !== undefined ? productosOverride : carrito;
    const cuponAUusar = cuponOverride !== undefined ? cuponOverride : cuponAplicado;

    try {
      const response = await axios.put(`${API_URL}/carrito/${userId}`, {
        productos: productosAUsar,
        cupon_aplicado: cuponAUusar
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
    if (!userId) throw new Error("Usuario no logueado.");
    
    const idProducto = producto.id_producto || producto.id;

    // Lógica especial para suscripciones: Asegurar exclusividad
    if (SUSCRIPCION_IDS.includes(idProducto)) {
        // Regla: No puedes adquirir un plan si ya tienes uno ACTIVO.
        if (suscripcionActivaId) {
            throw new Error(`Ya tienes la suscripción activa (ID: ${suscripcionActivaId}). Cancélala antes de adquirir otra.`);
        }
        
        // 1. Filtra cualquier suscripción existente del carrito
        const productosSinSuscripciones = carrito.filter(item => !SUSCRIPCION_IDS.includes(item.id_producto));
        
        // 2. Prepara el nuevo producto de suscripción
        const productoParaCarrito = {
            id_producto: idProducto,
            cantidad: 1,
            nombre: producto.nombre,
            precio: producto.precioOferta || producto.priceValue, // Usar priceValue para planes
            foto: producto.foto || producto.imagen,
            esPromocion: !!producto.precioOferta
        };

        const nuevoCarrito = [...productosSinSuscripciones, productoParaCarrito];
        
        // 3. Actualiza el carrito local y en el servidor
        setCarrito(nuevoCarrito);
        await actualizarCarritoEnServidor(nuevoCarrito, cuponAplicado);
        
        // El useEffect de abajo se encargará de actualizar planPendienteId
        return; 
    }
    
    // Lógica estándar para otros productos
    try {
      const productoParaCarrito = {
        id_producto: idProducto,
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
        const nuevosProductos = response.data.productos;
        setCarrito(nuevosProductos);

        // Si el ID eliminado es una suscripción, limpiamos el estado correspondiente.
        if (SUSCRIPCION_IDS.includes(id_producto)) {
            if (id_producto === suscripcionActivaId) {
                setSuscripcionActivaId(null); // Cancelación de la suscripción activa
            }
            if (id_producto === planPendienteId) {
                setPlanPendienteId(null); // Eliminación de la suscripción pendiente
            }
        }
        
    } catch (error) {
      console.error("Error al eliminar del carrito:", error);
      throw error;
    }
  };

  // NUEVA FUNCIÓN: SIMULACIÓN DE PAGO EXITOSO
  const completarPagoSimulado = async () => {
    if (!planPendienteId) {
        alert("Error: No hay una suscripción pendiente para pagar en el carrito.");
        return;
    }

    // 1. Activa la nueva suscripción
    const nuevoPlanActivoId = planPendienteId;

    // 2. Limpia la suscripción del carrito (se asume pagada)
    const nuevoCarrito = carrito.filter(item => item.id_producto !== nuevoPlanActivoId);
    
    // 3. Actualiza estados globales
    setSuscripcionActivaId(nuevoPlanActivoId); // Establece el plan como ACTIVO
    setPlanPendienteId(null); // Limpia el estado pendiente
    setCarrito(nuevoCarrito); // Limpia el producto del carrito local

    // 4. Guarda el nuevo estado del carrito en el servidor (sin el plan)
    await actualizarCarritoEnServidor(nuevoCarrito, cuponAplicado);
    
    alert(`¡Pago exitoso! La suscripción (ID: ${nuevoPlanActivoId}) ha sido activada.`);

    return nuevoPlanActivoId;
  };

  // EFECTO: Sincronizar planPendienteId con el carrito cada vez que el carrito cambia
  useEffect(() => {
    const suscripcionEnCarrito = carrito.find(item => SUSCRIPCION_IDS.includes(item.id_producto));
    
    if (suscripcionEnCarrito) {
        setPlanPendienteId(suscripcionEnCarrito.id_producto);
    } else {
        setPlanPendienteId(null);
    }
  }, [carrito]);


  const cambiarCantidad = async (id_producto, cantidad) => {
    if (!userId) return;
    if (SUSCRIPCION_IDS.includes(id_producto)) {
        alert("No puedes cambiar la cantidad de una suscripción, solo puede haber 1.");
        return;
    }

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
    // ... (Tu función existente) ...
    if (!userId) return;

    try {
      await axios.put(`${API_URL}/carrito/${userId}`, {
        productos: [],
        cupon_aplicado: null
      });
      setCarrito([]);
      setCuponAplicado(null);
      // Opcional: Si se vacía el carrito, limpiamos todos los estados de suscripción
      setSuscripcionActivaId(null); 
      setPlanPendienteId(null);
    } catch (error) {
      console.error("Error al vaciar el carrito:", error);
      throw error;
    }
  };

  const aplicarCupon = async (codigo) => {
    // ... (Tu función existente) ...
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
      suscripcionActivaId, // 👈 Exportado
      planPendienteId, // 👈 Exportado
      agregarAlCarrito,
      eliminarDelCarrito,
      cambiarCantidad,
      vaciarCarrito,
      aplicarCupon,
      completarPagoSimulado // 👈 Exportado para la vista de pago
    }}>
      {children}
    </CarritoContext.Provider>
  );
};
