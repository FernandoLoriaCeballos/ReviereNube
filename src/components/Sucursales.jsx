import React, { useState, useEffect } from "react";
import Inventario from "./InventarioSucursal";
import "./Sucursales.css";

// Añadir API_URL usando la variable de entorno (con fallback)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Sucursales() {
    const [sucursalId, setSucursalId] = useState(0); // 0 = Todas
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Usar la URL de la API
        fetch(`${API_URL}/empresas`)
            .then((res) => {
                if (!res.ok) throw new Error("Error al obtener empresas");
                return res.json();
            })
            .then((data) => {
                setEmpresas(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Error de red");
                setLoading(false);
            });
    }, []);

    return (
        <div className="sucursales-container">
            <h1>Inventarios por sucursales</h1>

            <select
                className="sucursales-select"
                onChange={(e) => {
                    const val = e.target.value;
                    // convertir a número si es numérico, si no mantener string (p.ej. ObjectId)
                    setSucursalId(val === "0" ? 0 : (isNaN(val) ? val : Number(val)));
                }}
                value={sucursalId}
            >
                <option value={0}>Todas</option>

                {loading && <option disabled>Cargando sucursales...</option>}
                {error && <option disabled>Error al cargar</option>}

                {!loading &&
                    !error &&
                    empresas.map((emp) => {
                        // preferir id_empresa numérico si existe, sino _id u id
                        const value = emp.id_empresa ?? emp.id ?? emp._id;
                        const label = emp.nombre_empresa ?? emp.nombre ?? `Empresa ${value}`;
                        return (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        );
                    })}
            </select>

            <div className="inventario-section">
                {/* tarjeta responsiva que imita el layout de Productos.jsx */}
                <div className="inventario-card">
                    <div className="table-responsive">
                        <Inventario sucursalId={sucursalId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sucursales;
