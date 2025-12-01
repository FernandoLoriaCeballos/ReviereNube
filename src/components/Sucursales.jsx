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
                {/* --- NUEVO BOTÓN REGRESAR --- */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
                    <button
                        onClick={() => window.location.href = '/usuarios'}
                        style={{
                            background: 'linear-gradient(90deg, #FF512F 0%, #F09819 100%)', // Degradado naranja similar a la imagen
                            color: 'white',
                            border: 'none',
                            padding: '10px 25px',
                            borderRadius: '50px', // Forma de píldora
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Regresar
                    </button>
                </div>
                {/* ----------------------------- */}

                {/* MODIFICACIÓN: Título fijo como "Gestor de Inventarios" */}
                <h1>Inventarios por sucursales</h1>

                {/* Si no es restringido (es Superadmin), mostramos el selector */}
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
                            {/* Aquí dentro se cargará el título "genial" de Inventario: BDN */}
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