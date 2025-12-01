import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Inventario from "./InventarioSucursal";
import "./Sucursales.css";

// Añadir API_URL usando la variable de entorno (con fallback)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Sucursales() {
    const navigate = useNavigate();
    const [sucursalId, setSucursalId] = useState(0); // 0 = Todas
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -----------------------------------------------------------
    // AGREGADO: Estado para controlar la recarga del inventario
    // -----------------------------------------------------------
    const [refreshKey, setRefreshKey] = useState(0);

    // useEffect de carga de empresas (Sin cambios)
    useEffect(() => {
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

    // -----------------------------------------------------------
    // AGREGADO: Escuchar el evento que manda el Navbar
    // -----------------------------------------------------------
    useEffect(() => {
        const handleUpdate = () => {
            console.log("Detectada compra en Navbar, recargando inventario...");
            // Incrementamos la key para forzar remontaje del hijo
            setRefreshKey(prev => prev + 1); 
        };

        window.addEventListener("actualizar-inventario", handleUpdate);

        // Limpiar evento al desmontar
        return () => {
            window.removeEventListener("actualizar-inventario", handleUpdate);
        };
    }, []);

    return (
        <>
            {/* --- NAV (insertado) --- */}
            <nav className="bg-white shadow-md border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center">
                    </a>
                    <div className="hidden lg:flex items-center space-x-8">
                        <a href="/homeadmin" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">DASHBOARD</a>
                        <a href="/usuarios" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">USUARIOS</a>
                        <a href="/productos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">PRODUCTOS</a>
                        <a href="/empresas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">SUCURSALES</a>
                        <a href="/sucursales" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">INVENTARIO(S)</a>
                        <a href="/recibos" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">RECIBOS</a>
                        <a href="/reporte-ventas" className="text-gray-700 hover:text-red-500 transition duration-300 uppercase font-medium">REPORTE DE VENTAS</a>
                    </div>
                </div>
            </nav>

            <div className="sucursales-container">
                {/* BOTÓN REGRESAR */}
                <div className="boton-regreso-wrapper">
                    <button 
                        className="btn-regresar" 
                        onClick={() => navigate('/usuarios')}
                    >
                        Regresar
                    </button>
                </div>

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
                    <option value={0}>Todas las sucursales</option>

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
                            {/* AGREGADO: key={refreshKey}
                                Al cambiar refreshKey, React desmonta y monta de nuevo este componente,
                                lo que dispara su fetch interno y actualiza los stocks.
                            */}
                            <Inventario 
                                key={refreshKey} 
                                sucursalId={sucursalId} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Sucursales;