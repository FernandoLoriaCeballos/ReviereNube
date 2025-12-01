import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; 
import "./InventarioSucursal.css";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Inventario({ sucursalId }) {
    // --- LÓGICA DE SEGURIDAD Y EMPRESA ---
    const rolUsuario = Cookies.get("rol");
    const idEmpresaUsuario = Cookies.get("id_empresa");

    const esRestringido = rolUsuario !== "superadmin" && idEmpresaUsuario;
    const empresaActualId = esRestringido ? parseInt(idEmpresaUsuario) : sucursalId;

    const [productos, setProductos] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: "",
        cantidad: "",
        precio: "",
        descripcion: "",
        categoria: "",
        id_empresa: empresaActualId !== 0 ? empresaActualId : "",
    });
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [aumentarCantidad, setAumentarCantidad] = useState(0);
    const [empresas, setEmpresas] = useState([]);

    const fetchProductos = async () => {
        setCargando(true);
        try {
            const url = empresaActualId !== 0
                ? `${API_URL}/productos?id_empresa=${empresaActualId}`
                : `${API_URL}/productos`;

            const response = await axios.get(url);
            setProductos(response.data);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            setProductos([]);
        } finally {
            setCargando(false);
        }
    };

    const fetchEmpresas = async () => {
        try {
            const response = await axios.get(`${API_URL}/empresas`);
            setEmpresas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al obtener empresas:", error);
        }
    };

    useEffect(() => {
        fetchEmpresas();
        fetchProductos();
    }, [sucursalId, empresaActualId]);

    const cerrarYResetearModal = () => {
        setMostrarModal(false);
        setNuevoProducto({
            nombre: "",
            cantidad: "",
            precio: "",
            descripcion: "",
            categoria: "",
            id_empresa: esRestringido ? empresaActualId : (empresaActualId !== 0 ? empresaActualId : "")
        });
        setEditandoId(null);
        setProductoSeleccionado(null);
        setAumentarCantidad(0);
    };

    const handleNombreChange = (valor) => {
        setNuevoProducto({ ...nuevoProducto, nombre: valor });
        const encontrado = productos.find(p => p.nombre === valor);
        if (encontrado) {
            setProductoSeleccionado(encontrado);
            setNuevoProducto(prev => ({
                ...prev,
                cantidad: prev.cantidad === "" || prev.cantidad === null ? String(encontrado.stock || "") : prev.cantidad,
                precio: prev.precio === "" || prev.precio === null ? String(encontrado.precio ?? "") : prev.precio,
                descripcion: prev.descripcion === "" ? (encontrado.descripcion || "") : prev.descripcion,
                categoria: prev.categoria === "" ? (encontrado.categoria || "") : prev.categoria,
                id_empresa: encontrado.id_empresa
            }));
            setAumentarCantidad(0);
        } else {
            setProductoSeleccionado(null);
            setAumentarCantidad(0);
        }
    };

    const handleSubmit = async () => {
        const precioFinal = nuevoProducto.precio !== ""
            ? parseFloat(nuevoProducto.precio)
            : (productoSeleccionado ? parseFloat(productoSeleccionado.precio || 0) : 0);

        const empresaParaGuardar = esRestringido ? empresaActualId : (nuevoProducto.id_empresa || null);

        if (editandoId !== null) {
            const productoParaAPI = {
                nombre: nuevoProducto.nombre,
                stock: parseInt(nuevoProducto.cantidad, 10),
                precio: precioFinal,
                descripcion: nuevoProducto.descripcion,
                categoria: nuevoProducto.categoria,
                id_empresa: empresaParaGuardar,
            };
            try {
                const idProducto = productoSeleccionado?._id || editandoId;
                await axios.put(`${API_URL}/productos/${idProducto}`, productoParaAPI);
                alert("Producto actualizado exitosamente.");
            } catch (error) {
                console.error("Error al actualizar producto:", error);
                alert("Error al actualizar.");
            }
            cerrarYResetearModal();
            fetchProductos();
            return;
        }

        if (productoSeleccionado) {
            try {
                const cantidadExistente = parseInt(productoSeleccionado.stock || 0, 10);
                const aumento = parseInt(aumentarCantidad || 0, 10);
                const nuevoStock = Number.isNaN(aumento) ? cantidadExistente : (cantidadExistente + aumento);

                const productoParaAPI = {
                    nombre: nuevoProducto.nombre || productoSeleccionado.nombre,
                    stock: nuevoStock,
                    precio: precioFinal,
                    descripcion: nuevoProducto.descripcion || productoSeleccionado.descripcion,
                    categoria: nuevoProducto.categoria || productoSeleccionado.categoria,
                };

                await axios.put(`${API_URL}/productos/${productoSeleccionado._id}`, productoParaAPI);
                alert("Stock actualizado exitosamente.");
            } catch (error) {
                console.error("Error al actualizar stock:", error);
            }
            cerrarYResetearModal();
            fetchProductos();
            return;
        }

        const productoParaAPI = {
            nombre: nuevoProducto.nombre,
            stock: parseInt(nuevoProducto.cantidad || "0", 10),
            precio: parseFloat(nuevoProducto.precio || "0"),
            descripcion: nuevoProducto.descripcion,
            categoria: nuevoProducto.categoria,
            id_empresa: empresaParaGuardar,
        };

        try {
            await axios.post(`${API_URL}/productos`, productoParaAPI);
            alert("Producto agregado exitosamente.");
        } catch (error) {
            console.error("Error al agregar producto:", error);
            alert("Error al agregar el producto.");
        }

        cerrarYResetearModal();
        fetchProductos();
    };

    const eliminarProducto = async (idAEliminar) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
        try {
            await axios.delete(`${API_URL}/productos/${idAEliminar}`);
            alert("Producto eliminado exitosamente.");
            fetchProductos();
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            alert("Error al eliminar.");
        }
        cerrarYResetearModal();
    };

    const prepararEdicion = (producto) => {
        setEditandoId(producto._id);
        setProductoSeleccionado(producto);
        setNuevoProducto({
            nombre: producto.nombre || "",
            cantidad: producto.stock || "",
            precio: producto.precio || "",
            descripcion: producto.descripcion || "",
            categoria: producto.categoria || "",
            id_empresa: producto.id_empresa || "",
        });
        setAumentarCantidad(0);
        setMostrarModal(true);
    };

    const editarProducto = prepararEdicion;

    const productosFiltrados = productos.filter((p) => {
        const termino = filtro.toLowerCase();
        return (
            p.nombre?.toLowerCase().includes(termino) ||
            String(p.stock)?.includes(termino) ||
            String(p.precio)?.includes(termino)
        );
    });

    const getNombreEmpresa = (id_empresa) => {
        if (!id_empresa) return 'General';
        const empresa = empresas.find(e => e.id_empresa === id_empresa || e._id === id_empresa);
        return empresa ? empresa.nombre_empresa : `Empresa ${id_empresa}`;
    };

    return (
        <div className="inventario-container">
            {/* CABECERA */}
            <div className="mb-8 pb-4 border-b border-gray-200">
                <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight flex items-center flex-wrap gap-2">
                    {empresaActualId === 0 ? (
                        <span>Administración Central</span>
                    ) : (
                        <>
                            <span className="text-gray-800">Inventario:</span>
                            <span className="text-red-600 bg-red-50 px-3 py-1 rounded-md text-2xl">
                                {getNombreEmpresa(empresaActualId)}
                            </span>
                        </>
                    )}
                </h2>
                <p className="text-gray-500 text-sm mt-2 font-medium ml-1">
                    {empresaActualId === 0 
                        ? "Vista global de todos los productos del sistema" 
                        : "Gestión exclusiva de productos para esta sucursal"}
                </p>
            </div>

            {/* BARRA DE ACCIONES */}
            <div className="acciones-superiores">
                <button
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    onClick={() => {
                        cerrarYResetearModal();
                        setMostrarModal(true);
                    }}
                >
                    Agregar nuevo producto
                </button>
                <div className="filtro">
                    <input
                        type="text"
                        placeholder="Buscar producto..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>

            {cargando && <p className="text-gray-500 italic mt-4">Cargando lista de productos...</p>}

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>
                            {editandoId !== null
                                ? "Editar producto"
                                : "Agregar nuevo producto"}
                        </h3>

                        <input type="text" placeholder="Nombre" list="productos-list" value={nuevoProducto.nombre} onChange={(e) => handleNombreChange(e.target.value)} />
                        <datalist id="productos-list">{productos.map(p => (<option key={p._id} value={p.nombre} />))}</datalist>
                        <textarea placeholder="Descripción" value={nuevoProducto.descripcion} onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })} />
                        <input type="text" placeholder="Categoría" value={nuevoProducto.categoria} onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })} />
                        <input type="number" placeholder="Stock (Cantidad)" value={nuevoProducto.cantidad} onChange={(e) => setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })} disabled={productoSeleccionado && editandoId === null} />
                        <input type="number" step="0.01" placeholder="Precio" value={nuevoProducto.precio} onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })} disabled={productoSeleccionado && editandoId === null} />

                        {!esRestringido && (
                            <div className="empresa-selector">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Empresa(s)</label>
                                <select multiple value={Array.isArray(nuevoProducto.id_empresa) ? nuevoProducto.id_empresa : [nuevoProducto.id_empresa].filter(Boolean)} onChange={(e) => { const values = Array.from(e.target.selectedOptions, option => option.value); setNuevoProducto({ ...nuevoProducto, id_empresa: values.length === 1 ? values[0] : values }); }} className="w-full p-2 border rounded mb-4 min-h-[100px]" disabled={empresaActualId !== 0}>
                                    {empresas.map((emp) => (<option key={emp._id} value={emp.id_empresa || emp._id}>{emp.nombre_empresa}</option>))}
                                </select>
                            </div>
                        )}

                        {productoSeleccionado && editandoId === null && (
                            <div style={{ marginTop: 8 }}>
                                <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>Cantidad a aumentar</label>
                                <input type="number" min="0" value={aumentarCantidad} onChange={(e) => setAumentarCantidad(e.target.value)} />
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
                            <button onClick={handleSubmit} disabled={!esRestringido && !nuevoProducto.id_empresa && empresaActualId === 0} style={{ display: "block", margin: "0 auto" }}>
                                {editandoId !== null ? "Actualizar" : (productoSeleccionado ? "Actualizar stock" : "Agregar")}
                            </button>
                        </div>
                        <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md" onClick={cerrarYResetearModal}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* TABLA MEJORADA Y MÁS GRANDE */}
            <div className="w-full overflow-hidden rounded-lg shadow-sm border border-gray-200 mt-6">
                <table className="w-full text-base text-left text-gray-800">
                    <thead className="text-sm uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-gray-600">Nombre</th>
                            <th className="px-6 py-4 font-bold text-gray-600">Descripción</th>
                            <th className="px-6 py-4 font-bold text-gray-600">Precio</th>
                            <th className="px-6 py-4 font-bold text-gray-600 text-center">Stock</th>
                            <th className="px-6 py-4 font-bold text-gray-600">Categoría</th>
                            <th className="px-6 py-4 font-bold text-gray-600 text-center">Sucursal</th>
                            <th className="px-6 py-4 font-bold text-gray-600 text-center">Foto</th>
                            <th className="px-6 py-4 font-bold text-gray-600 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {productosFiltrados.map((producto) => (
                            <tr key={producto._id} className="hover:bg-gray-50 transition duration-150">
                                {/* Celdas con más padding y texto base */}
                                <td className="px-6 py-4 font-medium text-gray-900 break-words max-w-[250px]">
                                    {producto.nombre}
                                </td>
                                <td className="px-6 py-4 text-gray-500 break-words max-w-[300px] text-sm" title={producto.descripcion}>
                                    {producto.descripcion}
                                </td>
                                <td className="px-6 py-4 font-semibold text-green-600 whitespace-nowrap text-lg">
                                    ${Number(producto.precio).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        producto.stock > 10 ? 'bg-green-100 text-green-800' : 
                                        producto.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {producto.stock}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                        {producto.categoria}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        {getNombreEmpresa(producto.id_empresa)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center">
                                        {producto.foto ? (
                                            <img src={producto.foto} alt={producto.nombre} className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <span className="text-xs text-gray-400">N/A</span>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center space-x-3">
                                        <button 
                                            onClick={() => editarProducto(producto)} 
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => eliminarProducto(producto._id)} 
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {productosFiltrados.length === 0 && !cargando && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No se encontraron productos.</p>
                </div>
            )}
        </div>
    );
}

export default Inventario;