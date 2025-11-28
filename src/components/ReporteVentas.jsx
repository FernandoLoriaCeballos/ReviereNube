import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import "./ReporteVentas.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ReporteVentas() {
    const navigate = useNavigate(); 
    
    // Datos crudos
    const [ventas, setVentas] = useState([]); 
    const [empresas, setEmpresas] = useState([]); // Lista de sucursales
    
    // Datos filtrados y visualización
    const [ventasFiltradas, setVentasFiltradas] = useState([]); 
    const [cargando, setCargando] = useState(true);
    
    // Estados de los filtros
    const [filtroTiempo, setFiltroTiempo] = useState("todos"); 
    const [sucursalId, setSucursalId] = useState(0); // 0 = Todas

    const [resumen, setResumen] = useState({
        totalDinero: 0,
        totalItems: 0,
        totalVentas: 0
    });

    // Carga inicial
    useEffect(() => {
        fetchDatosIniciales();
    }, []);

    // Re-filtrar cuando cambie cualquier filtro o los datos base
    useEffect(() => {
        aplicarFiltros();
    }, [ventas, filtroTiempo, sucursalId]);

    const fetchDatosIniciales = async () => {
        // Opcional: Poner cargando en true si quieres feedback visual al actualizar
        // setCargando(true); 
        try {
            console.log("🔄 Cargando datos...");
            // Cargar ventas y empresas en paralelo
            const [resVentas, resEmpresas] = await Promise.all([
                axios.get(`${API_URL}/recibos`),
                axios.get(`${API_URL}/empresas`)
            ]);

            const dataVentas = Array.isArray(resVentas.data) ? resVentas.data : [];
            const dataEmpresas = Array.isArray(resEmpresas.data) ? resEmpresas.data : [];

            setVentas(dataVentas);
            setEmpresas(dataEmpresas);
            // setCargando(false);
            console.log("✅ Datos actualizados");
        } catch (error) {
            console.error("Error al cargar datos:", error);
            // setVentas([]);
            // setCargando(false);
        }
    };

    const aplicarFiltros = () => {
        let filtradas = [...ventas];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // 1. FILTRO POR TIEMPO
        if (filtroTiempo === "dia") {
            filtradas = filtradas.filter(v => {
                const f = new Date(v.fecha_emi);
                f.setHours(0,0,0,0);
                return f.getTime() === hoy.getTime();
            });
        } else if (filtroTiempo === "semana") {
            const hace7dias = new Date(hoy);
            hace7dias.setDate(hoy.getDate() - 7);
            filtradas = filtradas.filter(v => new Date(v.fecha_emi) >= hace7dias);
        } else if (filtroTiempo === "mes") {
            filtradas = filtradas.filter(v => {
                const f = new Date(v.fecha_emi);
                return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
            });
        } else if (filtroTiempo === "anio") {
            filtradas = filtradas.filter(v => {
                const f = new Date(v.fecha_emi);
                return f.getFullYear() === hoy.getFullYear();
            });
        }

        // 2. FILTRO POR SUCURSAL
        if (sucursalId !== 0) {
            filtradas = filtradas.filter(v => {
                // v.id_empresa viene del backend (puede ser null si es venta general)
                // Comparamos convirtiendo a número para asegurar
                return Number(v.id_empresa) === Number(sucursalId);
            });
        }

        setVentasFiltradas(filtradas);
        calcularResumen(filtradas);
    };

    const calcularResumen = (datos) => {
        let dinero = 0;
        let items = 0;

        datos.forEach(venta => {
            dinero += (venta.precio_total || 0);
            
            if (venta.detalle) {
                const partes = venta.detalle.split(',');
                partes.forEach(p => {
                    const num = parseInt(p.trim().split(' ')[0]);
                    if (!isNaN(num)) items += num;
                });
            }
        });

        setResumen({
            totalDinero: dinero,
            totalItems: items,
            totalVentas: datos.length
        });
    };

    const formatearFecha = (fechaISO) => {
        if (!fechaISO) return "-";
        return new Date(fechaISO).toLocaleDateString('es-MX', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

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

            <div className="reporte-container">
                {/* BOTÓN REGRESAR */}
                <div className="boton-regreso-wrapper">
                    <button 
                        className="btn-regresar" 
                        onClick={() => navigate('/usuarios')}
                    >
                        Regresar
                    </button>
                </div>

                <h1 className="titulo-pagina">Reporte de Ventas</h1>

                {/* --- BARRA DE HERRAMIENTAS (Filtros) --- */}
                <div className="toolbar-reporte">
                    
                    {/* --- NUEVO BOTÓN DE ACTUALIZAR --- */}
                    {/* Usa la misma clase btn-regresar para mantener el estilo visual */}
                    <button 
                        className="btn-regresar" 
                        onClick={fetchDatosIniciales}
                        style={{ marginRight: '10px' }} // Separación visual
                    >
                        Actualizar Tabla
                    </button>

                    {/* SELECCIÓN DE SUCURSAL */}
                    <div className="filtro-grupo">
                        <label className="filtro-label">Sucursal:</label>
                        <select 
                            className="select-sucursal"
                            value={sucursalId}
                            onChange={(e) => setSucursalId(Number(e.target.value))}
                        >
                            <option value={0}>Todas las Sucursales</option>
                            {empresas.map((emp) => (
                                <option key={emp.id_empresa} value={emp.id_empresa}>
                                    {emp.nombre_empresa}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SELECCIÓN DE TIEMPO */}
                    <div className="filtro-grupo">
                        <label className="filtro-label">Periodo:</label>
                        <div className="btn-group">
                            <button className={`btn-filtro ${filtroTiempo === 'dia' ? 'activo' : ''}`} onClick={() => setFiltroTiempo('dia')}>Hoy</button>
                            <button className={`btn-filtro ${filtroTiempo === 'semana' ? 'activo' : ''}`} onClick={() => setFiltroTiempo('semana')}>Semana</button>
                            <button className={`btn-filtro ${filtroTiempo === 'mes' ? 'activo' : ''}`} onClick={() => setFiltroTiempo('mes')}>Mes</button>
                            <button className={`btn-filtro ${filtroTiempo === 'anio' ? 'activo' : ''}`} onClick={() => setFiltroTiempo('anio')}>Año</button>
                            <button className={`btn-filtro ${filtroTiempo === 'todos' ? 'activo' : ''}`} onClick={() => setFiltroTiempo('todos')}>Histórico</button>
                        </div>
                    </div>
                </div>

                {/* TARJETAS DE RESUMEN */}
                <div className="resumen-cards">
                    <div className="card-dato verde">
                        <h3>Ingresos Totales</h3>
                        <p>${resumen.totalDinero.toFixed(2)}</p>
                    </div>
                    <div className="card-dato azul">
                        <h3>Productos Vendidos</h3>
                        <p>{resumen.totalItems} <span className="unidad">unidades</span></p>
                    </div>
                    <div className="card-dato morado">
                        <h3>Total Transacciones</h3>
                        <p>{resumen.totalVentas}</p>
                    </div>
                </div>

                {/* TABLA */}
                <div className="tabla-card">
                    <div className="tabla-header">
                        <h3>Historial de Transacciones</h3>
                        <div className="resultados-count">
                            {sucursalId === 0 ? "Todas las sucursales" : empresas.find(e => e.id_empresa === sucursalId)?.nombre_empresa} 
                            {' • '}
                            {ventasFiltradas.length} registros
                        </div>
                    </div>

                    <div className="tabla-responsive">
                        <table className="tabla-ventas">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Sucursal</th>
                                    <th>Detalle</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cargando ? (
                                    <tr><td colSpan="5" className="text-center">Cargando datos...</td></tr>
                                ) : ventasFiltradas.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">No hay ventas con estos filtros.</td></tr>
                                ) : (
                                    ventasFiltradas.map((venta) => (
                                        <tr key={venta._id || venta.id_recibo}>
                                            <td className="fecha-col">{formatearFecha(venta.fecha_emi)}</td>
                                            <td>
                                                <span className="badge sucursal">
                                                    {venta.nombre_sucursal || "General / Web"}
                                                </span>
                                            </td>
                                            <td className="detalle-col" title={venta.detalle}>
                                                {venta.detalle}
                                            </td>
                                            <td>
                                                <div className="cliente-info">
                                                    <span className="icono-user">👤</span>
                                                    {venta.nombre_usuario}
                                                </div>
                                            </td>
                                            <td className="precio-col">
                                                ${venta.precio_total?.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ReporteVentas;