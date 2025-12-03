import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import "./ReporteVentas.css";

const API_URL = 'http://localhost:3000';

function ReporteVentas() {
    const navigate = useNavigate();

    // --- LÓGICA DE SEGURIDAD ---
    const rolUsuario = Cookies.get("rol");
    const idEmpresaUsuario = Cookies.get("id_empresa");

    // Es restringido si NO es superadmin (Ej: administradorbdn@gmail.com)
    const esRestringido = rolUsuario !== "superadmin" && idEmpresaUsuario;

    // Datos crudos
    const [ventas, setVentas] = useState([]);
    // 'empresas' contendrá TODAS si es superadmin, o SOLO las de BDN si es restringido
    const [empresas, setEmpresas] = useState([]);

    // Datos filtrados y visualización
    const [ventasFiltradas, setVentasFiltradas] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Estados de los filtros
    const [filtroTiempo, setFiltroTiempo] = useState("todos");
    // Iniciamos en 0. Si es restringido, 0 significará "Todas las de BDN".
    const [sucursalId, setSucursalId] = useState(0);

    const [resumen, setResumen] = useState({
        totalDinero: 0,
        totalItems: 0,
        totalVentas: 0
    });

    // Carga inicial
    useEffect(() => {
        fetchDatosIniciales();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-filtrar cuando cambie cualquier filtro o los datos base
    useEffect(() => {
        if (!cargando) {
            aplicarFiltros();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ventas, filtroTiempo, sucursalId, cargando]);

    const fetchDatosIniciales = async () => {
        try {
            setCargando(true);
            console.log("🔄 Cargando datos...");
            const [resVentas, resEmpresas] = await Promise.all([
                axios.get(`${API_URL}/recibos`),
                axios.get(`${API_URL}/empresas`)
            ]);

            let dataVentas = Array.isArray(resVentas.data) ? resVentas.data : [];
            let dataEmpresas = Array.isArray(resEmpresas.data) ? resEmpresas.data : [];

            // --- LÓGICA DE SEGURIDAD PARA BDN ---
            if (esRestringido) {
                const miEmpresaId = Number(idEmpresaUsuario);

                // 1. FILTRAR EMPRESAS: Buscamos todas las que sean BDN
                // Mantenemos la propia del usuario Y cualquier otra que tenga "BDN" en el nombre.
                const empresasBDN = dataEmpresas.filter(emp => {
                    const nombreMayus = emp.nombre_empresa ? emp.nombre_empresa.toUpperCase() : "";
                    // Coincide con su ID O el nombre incluye "BDN" (ej. BDN - Uxmal)
                    return Number(emp.id_empresa) === miEmpresaId || nombreMayus.includes("BDN");
                });

                // Actualizamos la lista base de empresas solo con las permitidas
                dataEmpresas = empresasBDN;

                // 2. FILTRAR VENTAS INICIALES: Solo las que pertenezcan a esas empresas BDN
                const idsPermitidos = empresasBDN.map(e => Number(e.id_empresa));
                dataVentas = dataVentas.filter(v => idsPermitidos.includes(Number(v.id_empresa)));

                console.log(`✅ Usuario BDN detectado. Acceso a ${empresasBDN.length} sucursales.`);
            }

            setVentas(dataVentas);
            setEmpresas(dataEmpresas);

            // Inicializamos los datos filtrados con todo lo que hemos cargado (ya sea todo global o todo BDN)
            setVentasFiltradas(dataVentas);

        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setCargando(false);
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

        // 2. FILTRO POR SUCURSAL SELECCIONADA
        // Si elige una específica del dropdown, filtramos por ella.
        // Si elige 0 ("Todas"), muestra todo lo que hay en memoria (que ya está filtrado por BDN si aplica).
        if (sucursalId !== 0) {
            filtradas = filtradas.filter(v => Number(v.id_empresa) === Number(sucursalId));
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

    // Función auxiliar para obtener nombre de empresa por ID
    const getNombreEmpresaPorId = (id) => {
        if (!id || id === 0) return "General";
        // Busca en el estado 'empresas', que ya está filtrado según el rol
        const emp = empresas.find(e => e.id_empresa === Number(id));
        return emp ? emp.nombre_empresa : "Desconocida";
    };

    return (
        <>
            <nav className="bg-white shadow-md border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center"></a>
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
                <div className="boton-regreso-wrapper">
                    <button
                        className="btn-regresar"
                        onClick={() => navigate('/usuarios')}
                    >
                        Regresar
                    </button>
                </div>

                <h1 className="titulo-pagina">
                    {esRestringido
                        ? `Reporte de Ventas: Grupo BDN`
                        : "Reporte General de Ventas"}
                </h1>

                <div className="toolbar-reporte">
                    <button
                        className="btn-regresar"
                        onClick={fetchDatosIniciales}
                        style={{ marginRight: '10px' }}
                    >
                        Actualizar Tabla
                    </button>

                    {/* Selector de Sucursal: AHORA VISIBLE PARA TODOS */}
                    {/* La lista 'empresas' ya viene filtrada si es BDN */}
                    <div className="filtro-grupo">
                        <label className="filtro-label">Filtrar por Sucursal:</label>
                        <select
                            className="select-sucursal"
                            value={sucursalId}
                            onChange={(e) => setSucursalId(Number(e.target.value))}
                        >
                            <option value={0}>
                                {/* Texto dinámico según el rol */}
                                {esRestringido ? "Todas las sucursales BDN" : "Todas las Sucursales (General)"}
                            </option>
                            {empresas.map((emp) => (
                                <option key={emp.id_empresa} value={emp.id_empresa}>
                                    {emp.nombre_empresa}
                                </option>
                            ))}
                        </select>
                    </div>

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

                <div className="tabla-card">
                    <div className="tabla-header">
                        <h3>Historial de Transacciones</h3>
                        <div className="resultados-count">
                            {/* Etiqueta dinámica de qué se está viendo */}
                            {sucursalId === 0
                                ? (esRestringido ? "Vista Global BDN" : "Vista Global General")
                                : getNombreEmpresaPorId(sucursalId)
                            }
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
                                                    {venta.nombre_sucursal || getNombreEmpresaPorId(venta.id_empresa)}
                                                </span>
                                            </td>
                                            <td className="detalle-col" title={venta.detalle}>
                                                {venta.detalle}
                                            </td>
                                            <td>
                                                <div className="cliente-info">
                                                    <span className="icono-user">👤</span>
                                                    {venta.nombre_usuario || "Cliente"}
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