import React, { useState, useEffect } from "react";
import Inventario from "./InventarioSucursal";
import Cookies from "js-cookie"; 
import "./Sucursales.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Sucursales() {
    // --- LÓGICA DE SEGURIDAD ---
    const rolUsuario = Cookies.get("rol");
    const idEmpresaUsuario = Cookies.get("id_empresa");

    // Es restringido si NO es superadmin y tiene id_empresa
    const esRestringido = rolUsuario !== "superadmin" && idEmpresaUsuario;

    const [sucursalId, setSucursalId] = useState(esRestringido ? Number(idEmpresaUsuario) : 0);
    const [empresas, setEmpresas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        fetch(`${API_URL}/empresas`)
            .then((res) => {
                if (!res.ok) throw new Error("Error al obtener empresas");
                return res.json();
            })
            .then((data) => {
                const listaEmpresas = Array.isArray(data) ? data : [];
                setEmpresas(listaEmpresas);
                
                // Si es restringido, forzamos que la sucursal seleccionada sea la suya
                if (esRestringido) {
                    setSucursalId(Number(idEmpresaUsuario));
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || "Error de red");
                setLoading(false);
            });
    }, [esRestringido, idEmpresaUsuario]);

    useEffect(() => {
        const handleUpdate = () => {
            console.log("Detectada compra en Navbar, recargando inventario...");
            setRefreshKey(prev => prev + 1); 
        };

        window.addEventListener("actualizar-inventario", handleUpdate);
        return () => {
            window.removeEventListener("actualizar-inventario", handleUpdate);
        };
    }, []);

    return (
        <>
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
                {/* Título Principal */}
                <h1>Gestor de Inventarios</h1>

                {/* --- AQUÍ ESTÁ EL CAMBIO CLAVE --- */}
                {/* El selector SOLO se muestra si NO es restringido (es decir, solo para Superadmin) */}
                {!esRestringido && (
                    <select
                        className="sucursales-select"
                        onChange={(e) => {
                            const val = e.target.value;
                            setSucursalId(val === "0" ? 0 : (isNaN(val) ? val : Number(val)));
                        }}
                        value={sucursalId}
                    >
                        <option value={0}>Todas las sucursales</option>

                        {loading && <option disabled>Cargando sucursales...</option>}
                        {error && <option disabled>Error al cargar</option>}

                        {!loading && !error &&
                            empresas.map((emp) => {
                                const value = emp.id_empresa ?? emp.id ?? emp._id;
                                const label = emp.nombre_empresa ?? emp.nombre ?? `Empresa ${value}`;
                                return (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                );
                            })}
                    </select>
                )}

                <div className="inventario-section">
                    <div className="inventario-card">
                        <div className="table-responsive">
                            {/* El componente hijo se encarga de mostrar "Inventario: BDN" */}
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