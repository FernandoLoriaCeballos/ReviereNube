import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const ComprasRealizadas = () => {
  const [compras, setCompras] = useState([]);
  const userId = Cookies.get("id_usuario");

  useEffect(() => {
    // Verificar si el ID de usuario existe en las cookies
    if (userId) {
      // Obtener todas las compras realizadas
      axios.get("http://localhost:3000/recibos")
        .then((response) => {
          // Filtrar las compras por el ID del usuario
          const comprasFiltradas = response.data.filter(compra => compra.id_usuario === parseInt(userId));
          setCompras(comprasFiltradas);
        })
        .catch((error) => {
          console.error("Error al obtener las compras:", error);
        });
    } else {
      console.error("No se encontró el ID del usuario en las cookies");
    }
  }, [userId]);

  const escribirResena = (id_recibo) => {
    const comentario = prompt("Escribe tu comentario:");
    const calificacion = parseInt(prompt("Escribe tu calificación (1-5):"), 10);

    if (!comentario || !calificacion) {
      return; // Cancelar la operación si falta el comentario o la calificación
    }

    if (userId) {
      axios.post("http://localhost:3000/resenas", {
        id_producto: id_recibo, // En una implementación real, este ID debería estar relacionado con el producto específico
        id_usuario: parseInt(userId), // ID del usuario logueado
        calificacion,
        comentario
      })
        .then((response) => {
          console.log("Reseña agregada:", response.data);
          // Actualizar la lista de reseñas o mostrar un mensaje de éxito
        })
        .catch((error) => {
          console.error("Error al agregar la reseña:", error);
        });
    } else {
      console.error("No se encontró el ID del usuario en las cookies");
    }
  };

  return (
    <div>
      <h2>Mis Compras Realizadas</h2>
      {compras.length === 0 ? (
        <p>No has realizado ninguna compra.</p>
      ) : (
        <div>
          {compras.map((compra) => (
            <div key={compra.id_recibo} className="border p-4 mb-4">
              <h3>Compra #{compra.id_recibo}</h3>
              <p>{compra.detalle}</p>
              <p>Total: ${compra.precio_total}</p>
              <button onClick={() => escribirResena(compra.id_recibo)}>Escribir reseña</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComprasRealizadas;
