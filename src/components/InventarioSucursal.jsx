import React, { useState, useEffect } from "react";
import axios from "axios";
import "./InventarioSucursal.css";

// Definir la URL de la API base
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// El componente ahora gestiona la lista central de Productos del sistema
function Inventario({ sucursalId }) { 
    // sucursalId se mantiene en el componente, pero su lógica de filtrado será limitada
    // ya que no hay un endpoint de filtro /productos?sucursal=X.
    
    // ---- ESTADOS DEL COMPONENTE ----
    const [productos, setProductos] = useState([]);
    const [nuevoProducto, setNuevoProducto] = useState({
        nombre: "",
        cantidad: "", // Corresponde al campo 'stock' o 'cantidad' de tu modelo Producto
        precio: "",
        // Asumiendo que tu API requiere estos campos para el POST/PUT
        descripcion: "", 
        categoria: "",
        id_empresa: sucursalId !== 0 ? sucursalId : "", // Inicializar con sucursalId si está seleccionada
    });
    const [editandoId, setEditandoId] = useState(null);
    const [filtro, setFiltro] = useState("");
    const [mostrarModal, setMostrarModal] = useState(false);
    const [cargando, setCargando] = useState(false);
    
    // Almacena el producto completo, usando '_id' para la API
    const [productoSeleccionado, setProductoSeleccionado] = useState(null); 
    // NUEVO: cantidad a aumentar cuando se selecciona un producto existente
    const [aumentarCantidad, setAumentarCantidad] = useState(0);
    const [empresas, setEmpresas] = useState([]); // Nuevo estado para empresas

    // 1. FUNCIÓN DE LECTURA (GET /productos)
    const fetchProductos = async () => {
        setCargando(true);
        try {
            // Si hay sucursalId (empresa seleccionada), filtrar por ella
            const url = sucursalId !== 0 
                ? `${API_URL}/productos?id_empresa=${sucursalId}`
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

    // NUEVO: Función para cargar empresas
    const fetchEmpresas = async () => {
        try {
            const response = await axios.get(`${API_URL}/empresas`);
            setEmpresas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error al obtener empresas:", error);
        }
    };

    // Carga inicial y recarga al cambiar la vista de sucursal
    useEffect(() => {
        fetchEmpresas();
        fetchProductos();
    }, [sucursalId]);

    // Función para centralizar el cierre del modal y el reseteo de los estados
    const cerrarYResetearModal = () => {
        setMostrarModal(false);
        setNuevoProducto({ 
            nombre: "", 
            cantidad: "", 
            precio: "", 
            descripcion: "", 
            categoria: "" 
        });
        setEditandoId(null);
        setProductoSeleccionado(null);
        setAumentarCantidad(0);
    };

    // NUEVA: Manejar cambio en el input de Nombre (autocompletado)
    const handleNombreChange = (valor) => {
        setNuevoProducto({ ...nuevoProducto, nombre: valor });

        // Intentamos encontrar producto por nombre exacto
        const encontrado = productos.find(p => p.nombre === valor);
        if (encontrado) {
            setProductoSeleccionado(encontrado);

            // Rellenar campos que estén vacíos para no sobrescribir ediciones del usuario
            setNuevoProducto(prev => ({
                ...prev,
                // solo setear cantidad si el usuario no ha puesto un valor explícito
                cantidad: prev.cantidad === "" || prev.cantidad === null ? String(encontrado.stock || "") : prev.cantidad,
                precio: prev.precio === "" || prev.precio === null ? String(encontrado.precio ?? "") : prev.precio,
                descripcion: prev.descripcion === "" ? (encontrado.descripcion || "") : prev.descripcion,
                categoria: prev.categoria === "" ? (encontrado.categoria || "") : prev.categoria,
            }));
            // resetear campo aumentarCantidad por defecto a 0
            setAumentarCantidad(0);
        } else {
            // Si el texto no coincide con producto conocido, limpiar la selección
            setProductoSeleccionado(null);
            setAumentarCantidad(0);
        }
    };

    // 2. FUNCIÓN DE CREAR/ACTUALIZAR (POST /productos & PUT /productos/:id)
    const handleSubmit = async () => {
        // Preparar precio: si el usuario dejó vacío y hay productoSeleccionado usar su precio
        const precioFinal = nuevoProducto.precio !== "" 
            ? parseFloat(nuevoProducto.precio) 
            : (productoSeleccionado ? parseFloat(productoSeleccionado.precio || 0) : 0);

        // Lógica para ACTUALIZAR si estamos editando
        if (editandoId !== null) {
            const productoParaAPI = {
                nombre: nuevoProducto.nombre,
                stock: parseInt(nuevoProducto.cantidad, 10), 
                precio: precioFinal,
                descripcion: nuevoProducto.descripcion,
                categoria: nuevoProducto.categoria,
                id_empresa: nuevoProducto.id_empresa || null, // Usar el id_empresa del form
            };
            try {
                const idProducto = productoSeleccionado?._id || editandoId;
                await axios.put(`${API_URL}/productos/${idProducto}`, productoParaAPI);
                alert("Producto actualizado exitosamente.");
            } catch (error) {
                console.error("Error al actualizar producto:", error);
                alert("Error al actualizar el producto. Verifique los datos y el endpoint PUT /productos/:id.");
            }
            cerrarYResetearModal();
            fetchProductos();
            return;
        }

        // Si no estamos editando pero se seleccionó un producto existente -> aumentar stock (PUT)
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
                alert("Error al actualizar el stock. Verifique el servidor y el endpoint PUT /productos/:id.");
            }

            cerrarYResetearModal();
            fetchProductos();
            return;
        }

        // Si no hay producto seleccionado y no estamos editando -> crear nuevo (POST)
        const productoParaAPI = {
            nombre: nuevoProducto.nombre,
            stock: parseInt(nuevoProducto.cantidad || "0", 10), 
            precio: parseFloat(nuevoProducto.precio || "0"),
            descripcion: nuevoProducto.descripcion,
            categoria: nuevoProducto.categoria,
            id_empresa: sucursalId !== 0 ? sucursalId : null, // Asignar empresa si está seleccionada
        };

        try {
            await axios.post(`${API_URL}/productos`, productoParaAPI);
            alert("Producto agregado exitosamente.");
        } catch (error) {
            console.error("Error al agregar producto:", error);
            alert("Error al agregar el producto. Verifique los datos y el endpoint POST /productos.");
        }

        cerrarYResetearModal();
        fetchProductos();
    };

    // 3. FUNCIÓN DE ELIMINAR (DELETE /productos/:id)
    const eliminarProducto = async (idAEliminar) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            return;
        }

        try {
            // Lógica para ELIMINAR (DELETE /productos/:id)
            await axios.delete(`${API_URL}/productos/${idAEliminar}`);
            alert("Producto eliminado exitosamente.");
            
            fetchProductos(); // Recargar la lista
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            alert("Error al eliminar el producto. Verifique el servidor y el endpoint DELETE /productos/:id.");
        }
        cerrarYResetearModal();
    };

    // Función para preparar la edición, compatible con la API (_id)
    const prepararEdicion = (producto) => {
        setEditandoId(producto._id); 
        setProductoSeleccionado(producto); 
        setNuevoProducto({
            nombre: producto.nombre || "",
            cantidad: producto.stock || "",
            precio: producto.precio || "",
            descripcion: producto.descripcion || "",
            categoria: producto.categoria || "",
            id_empresa: producto.id_empresa || "", // Añadir id_empresa existente
        });
        setAumentarCantidad(0);
        setMostrarModal(true); 
    };

    const editarProducto = prepararEdicion;
    const abrirModalEdicionGeneral = prepararEdicion;

    // Lógica de filtrado (usando los campos de Producto: nombre, stock, precio)
    const productosFiltrados = productos.filter((p) => {
        const termino = filtro.toLowerCase();
        return (
            p.nombre?.toLowerCase().includes(termino) ||
            String(p.stock)?.includes(termino) || // Ahora se busca en 'stock'
            String(p.precio)?.includes(termino) ||
            (p.sucursal && String(p.sucursal).includes(termino)) // Si tuvieran sucursal
        );
    });

    // Función auxiliar para obtener nombre de empresa
    const getNombreEmpresa = (id_empresa) => {
        if (!id_empresa) return 'General';
        const empresa = empresas.find(e => e.id_empresa === id_empresa || e._id === id_empresa);
        return empresa ? empresa.nombre_empresa : `Empresa ${id_empresa}`;
    };

    return (
        <div className="inventario-container">
            <h2>
                {sucursalId === 0
                    ? "Administración de Productos (Central)"
                    : `Inventario (Vista Sucursal ${sucursalId})`}
            </h2>

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
                        placeholder="Buscar producto por nombre, stock o precio..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                    />
                </div>
            </div>
            
            {cargando && <p>Cargando lista de productos...</p>}
            
            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h3>
                            {editandoId !== null
                                ? "Editar producto (ID: " + editandoId + ")"
                                : "Agregar nuevo producto"}
                        </h3>
                        
                        {/* NOMBRE: input con datalist */}
                        <input
                            type="text"
                            placeholder="Nombre"
                            list="productos-list"
                            value={nuevoProducto.nombre}
                            onChange={(e) => handleNombreChange(e.target.value)}
                        />
                        <datalist id="productos-list">
                            {productos.map(p => (
                                <option key={p._id} value={p.nombre} />
                            ))}
                        </datalist>

                        <textarea
                            placeholder="Descripción"
                            value={nuevoProducto.descripcion}
                            onChange={(e) =>
                                setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })
                            }
                        />
                        <input
                            type="text"
                            placeholder="Categoría"
                            value={nuevoProducto.categoria}
                            onChange={(e) =>
                                setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })
                            }
                        />
                        {/* Campo Stock */}
                        <input
                            type="number"
                            placeholder="Stock (Cantidad)"
                            value={nuevoProducto.cantidad}
                            onChange={(e) =>
                                setNuevoProducto({ ...nuevoProducto, cantidad: e.target.value })
                            }
                            disabled={productoSeleccionado && editandoId === null}
                            onMouseDown={(e) => (productoSeleccionado && editandoId === null) && e.preventDefault()}
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Precio"
                            value={nuevoProducto.precio}
                            onChange={(e) =>
                                setNuevoProducto({ ...nuevoProducto, precio: e.target.value })
                            }
                            disabled={productoSeleccionado && editandoId === null}
                            onMouseDown={(e) => (productoSeleccionado && editandoId === null) && e.preventDefault()}
                        />

                        {/* Selector de empresa movido aquí y estilizado */}
                        <div className="empresa-selector">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa(s)
                            </label>
                            <select
                                multiple
                                value={Array.isArray(nuevoProducto.id_empresa) ? nuevoProducto.id_empresa : [nuevoProducto.id_empresa].filter(Boolean)}
                                onChange={(e) => {
                                    const values = Array.from(e.target.selectedOptions, option => option.value);
                                    setNuevoProducto({
                                        ...nuevoProducto,
                                        id_empresa: values.length === 1 ? values[0] : values
                                    });
                                }}
                                className="w-full p-2 border rounded mb-4 min-h-[100px]"
                                disabled={sucursalId !== 0}
                            >
                                {empresas.map((emp) => (
                                    <option 
                                        key={emp._id} 
                                        value={emp.id_empresa || emp._id}
                                        className="p-2 hover:bg-gray-100"
                                    >
                                        {emp.nombre_empresa}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Mantén presionado Ctrl (Cmd en Mac) para seleccionar múltiples empresas
                            </p>
                        </div>

                        {/* NUEVO: campo para aumentar cantidad solo relevante si hay producto seleccionado */}
                        {productoSeleccionado && editandoId === null && (
                            <div style={{ marginTop: 8 }}>
                                <label style={{ fontSize: 12, display: "block", marginBottom: 4 }}>
                                    Cantidad a aumentar (para el producto seleccionado)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Ej: 5"
                                    value={aumentarCantidad}
                                    onChange={(e) => setAumentarCantidad(e.target.value)}
                                />
                                <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                                    Stock actual: {productoSeleccionado.stock} — al aplicar se sumará la cantidad indicada.
                                </div>
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
                            <button 
                                onClick={handleSubmit}
                                disabled={!nuevoProducto.id_empresa && sucursalId === 0}
                                title={!nuevoProducto.id_empresa && sucursalId === 0 ? "Seleccione una empresa" : ""}
                                style={{ display: "block", margin: "0 auto" }}
                            >
                                {editandoId !== null ? "Actualizar" : (productoSeleccionado ? "Actualizar stock" : "Agregar")}
                            </button>

                            {/* Eliminado: botón rojo "Eliminar" que estaba sobrepuesto al botón "Actualizar" */}
                        </div>

                        <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md" onClick={cerrarYResetearModal}>
                                Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* reemplazo: tabla homogenizada con tailwind-like classes */}
            <table className="w-full text-sm text-left text-gray-800">
            <thead className="text-xs uppercase bg-gray-100 text-gray-700 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nombre</th>
                <th className="px-6 py-4 font-semibold">Descripción</th>
                <th className="px-6 py-4 font-semibold">Precio</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Sucursal</th>
                <th className="px-6 py-4 font-semibold">Foto</th>
                <th className="px-6 py-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((producto) => (
                <tr key={producto._id} className="border-b border-gray-200 hover:bg-gray-50 transition duration-200">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">{producto.nombre}</td>
                  <td className="px-6 py-4 max-w-xs truncate" title={producto.descripcion}>
                    {producto.descripcion}
                  </td>
                  <td className="px-6 py-4 font-medium text-green-600">${Number(producto.precio).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      producto.stock > 10 
                        ? 'bg-green-100 text-green-800' 
                        : producto.stock > 0 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.stock} unidades
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {producto.categoria}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                      {getNombreEmpresa(producto.id_empresa)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {producto.foto ? (
                      <img 
                        src={producto.foto} 
                        alt={producto.nombre} 
                        className="w-12 h-12 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin foto</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button 
                      onClick={() => editarProducto(producto)} 
                      className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarProducto(producto._id)} 
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
 
            {productosFiltrados.length === 0 && !cargando && (
                <p className="sin-resultados">No se encontraron productos.</p>
            )}
        </div>
    );
}

export default Inventario;