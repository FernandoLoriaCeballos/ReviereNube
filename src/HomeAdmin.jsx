import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import { 
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Star
} from "lucide-react";
import logo from './assets/img/logo.png';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const HomeAdmin = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    ventas: 0,
    resenas: 0
  });

  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [ventasPorMes, setVentasPorMes] = useState([]);
  const [productosPorCategoria, setProductosPorCategoria] = useState([]);
  const [stockProductos, setStockProductos] = useState([]);
  const [comprasDiarias, setComprasDiarias] = useState([]);
  const [evolucionUsuarios, setEvolucionUsuarios] = useState([]);
  const [distribucionResenas, setDistribucionResenas] = useState([]);
  const [registrosPorGenero, setRegistrosPorGenero] = useState([]);

  // Estados para los filtros de compras
  const [periodoCompras, setPeriodoCompras] = useState(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth());
  const [semanaSeleccionada, setSemanaSeleccionada] = useState(1);
  
  const [anioVentas, setAnioVentas] = useState(new Date().getFullYear());
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [stockMin, setStockMin] = useState("");
  const [stockMax, setStockMax] = useState("");

  // Función para obtener el número de semanas en un mes
  const getSemanasEnMes = (año, mes) => {
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    return Math.ceil((ultimoDia.getDate() + primerDia.getDay()) / 7);
  };

  // Función para obtener la fecha de inicio de una semana específica
  const getFechaInicioSemana = (año, mes, semana) => {
    const primerDia = new Date(año, mes, 1);
    const diasHastaPrimerLunes = (8 - primerDia.getDay()) % 7;
    const fechaInicio = new Date(año, mes, 1 + diasHastaPrimerLunes + (semana - 1) * 7);
    return fechaInicio;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usuarios, productos, resenas, recibos] = await Promise.all([
          axios.get(`${API_URL}/usuarios`),
          axios.get(`${API_URL}/productos`),
          axios.get(`${API_URL}/resenas`),
          axios.get(`${API_URL}/recibos`)
        ]);

        setStats({
          usuarios: usuarios.data.length,
          productos: productos.data.length,
          ventas: recibos.data.length,
          resenas: resenas.data.length
        });

        const categoriasCount = productos.data.reduce((acc, producto) => {
          const categoria = producto.categoria || 'Sin categoría';
          if (!acc[categoria]) {
            acc[categoria] = { name: categoria, value: 0 };
          }
          acc[categoria].value += 1;
          return acc;
        }, {});
        setProductosPorCategoria(Object.values(categoriasCount));

        const stockData = productos.data
          .map(producto => ({
            nombre: producto.nombre,
            stock: producto.stock
          }))
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 10);
        setStockProductos(stockData);

        // Procesar compras diarias
        const comprasProcesadas = recibos.data.reduce((acc, recibo) => {
          const fecha = new Date(recibo.fecha_emi);
          const fechaStr = fecha.toISOString().split('T')[0];
          
          if (!acc[fechaStr]) {
            acc[fechaStr] = {
              fecha: fechaStr,
              cantidad: 0,
              total: 0
            };
          }
          
          acc[fechaStr].cantidad += 1;
          acc[fechaStr].total += recibo.precio_total;
          return acc;
        }, {});

        const comprasArray = Object.values(comprasProcesadas)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        setComprasDiarias(comprasArray);

        const ventasProc = recibos.data.reduce((acc, recibo) => {
          const fecha = new Date(recibo.fecha_emi);
          const mes = fecha.toLocaleString('default', { month: 'long' });
          const anio = fecha.getFullYear();
          const key = `${mes}-${anio}`;
          
          if (!acc[key]) {
            acc[key] = {
              mes,
              anio,
              total: 0,
              cantidad: 0
            };
          }
          
          acc[key].total += recibo.precio_total;
          acc[key].cantidad += 1;
          return acc;
        }, {});

        const ventasArray = Object.values(ventasProc);
        setVentasPorMes(ventasArray);

        // Generar datos de evolución
        const ultimosSeisMeses = [];
        let usuariosAcumulados = 0;
        let resenasAcumuladas = 0;

        for (let i = 5; i >= 0; i--) {
          const fecha = new Date();
          fecha.setMonth(fecha.getMonth() - i);
          const mesActual = fecha.toLocaleString('default', { month: 'short' });
          
          const nuevosUsuarios = Math.floor(Math.random() * 30) + 50;
          const nuevasResenas = Math.floor(Math.random() * 20) + 20;
          
          usuariosAcumulados += nuevosUsuarios;
          resenasAcumuladas += nuevasResenas;
          
          ultimosSeisMeses.push({
            mes: mesActual,
            usuarios: nuevosUsuarios,
            usuarios_acumulados: usuariosAcumulados,
            resenas: nuevasResenas,
            resenas_acumuladas: resenasAcumuladas
          });
        }
        
        setEvolucionUsuarios(ultimosSeisMeses);

        // Procesar distribución de calificaciones de reseñas
        const distribucionCalificaciones = resenas.data.reduce((acc, resena) => {
          const calificacion = resena.calificacion;
          if (!acc[calificacion]) {
            acc[calificacion] = {
              calificacion: calificacion,
              cantidad: 0,
              porcentaje: 0
            };
          }
          acc[calificacion].cantidad += 1;
          return acc;
        }, {});

        // Calcular porcentajes
        const totalResenas = resenas.data.length;
        Object.values(distribucionCalificaciones).forEach(item => {
          item.porcentaje = (item.cantidad / totalResenas * 100).toFixed(1);
        });

        setDistribucionResenas(Object.values(distribucionCalificaciones));

        // Generar datos simulados de registro por género
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const datosGenero = meses.map(mes => ({
          mes,
          masculino: Math.floor(Math.random() * 50) + 20,
          femenino: Math.floor(Math.random() * 50) + 20,
          otro: Math.floor(Math.random() * 10) + 5
        }));

        setRegistrosPorGenero(datosGenero);

      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 300000);
    return () => clearInterval(intervalId);
  }, []);

  // Función para filtrar compras por período
  const filtrarComprasPorPeriodo = (compras) => {
    if (!compras || compras.length === 0) return [];

    const añoActual = new Date().getFullYear();
    
    if (!periodoCompras) {
      return compras;
    }
    
    if (periodoCompras === 'mes') {
      return compras.filter(compra => {
        const fechaCompra = new Date(compra.fecha);
        return fechaCompra.getMonth() === mesSeleccionado && 
               fechaCompra.getFullYear() === añoActual;
      });
    } else if (periodoCompras === 'semana') {
      const fechaInicioSemana = getFechaInicioSemana(añoActual, mesSeleccionado, semanaSeleccionada);
      const fechaFinSemana = new Date(fechaInicioSemana);
      fechaFinSemana.setDate(fechaInicioSemana.getDate() + 6);

      return compras.filter(compra => {
        const fechaCompra = new Date(compra.fecha);
        return fechaCompra >= fechaInicioSemana && fechaCompra <= fechaFinSemana;
      });
    }
    
    return compras;
  };

  const filtrarVentasMensuales = (ventas) => {
    if (!anioVentas) return ventas;
    return ventas.filter((venta) => venta.anio === anioVentas);
  };

  const filtrarProductosPorCategoria = (productos) => {
    if (!categoriaSeleccionada) return productos;
    return productos.filter((producto) => producto.name === categoriaSeleccionada);
  };

  const filtrarStockProductos = (productos) => {
    return productos.filter((producto) => {
      const stock = producto.stock;
      const minOk = !stockMin || stock >= Number(stockMin);
      const maxOk = !stockMax || stock <= Number(stockMax);
      return minOk && maxOk;
    });
  };

  // Componente SelectorPeriodo
  const SelectorPeriodo = () => {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    
    const numSemanas = getSemanasEnMes(new Date().getFullYear(), mesSeleccionado);

    return (
      <div className="flex items-center space-x-4">
        <select
          value={periodoCompras || ''}
          onChange={(e) => setPeriodoCompras(e.target.value || null)}
          className="bg-gray-700 rounded px-3 py-2 text-white"
        >
          <option value="">Todas las compras</option>
          <option value="mes">Por Mes</option>
          <option value="semana">Por Semana</option>
        </select>

        {periodoCompras && (
          <select
            value={mesSeleccionado}
            onChange={(e) => {
              setMesSeleccionado(Number(e.target.value));
              setSemanaSeleccionada(1);
            }}
            className="bg-gray-700 rounded px-3 py-2 text-white"
          >
            {meses.map((mes, index) => (
              <option key={mes} value={index}>{mes}</option>
            ))}
          </select>
        )}

        {periodoCompras === 'semana' && (
          <select
            value={semanaSeleccionada}
            onChange={(e) => setSemanaSeleccionada(Number(e.target.value))}
            className="bg-gray-700 rounded px-3 py-2 text-white"
          >
            {Array.from({ length: numSemanas }, (_, i) => i + 1).map((semana) => (
              <option key={semana} value={semana}>Semana {semana}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  return (
    <div className="bg-[#111827] min-h-screen font-['Montserrat']">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
        `}
      </style>
      <nav className="bg-[#111827] text-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/usuarios" className="hover:text-blue-500 uppercase">USUARIOS</a>
            <a href="/productos" className="hover:text-blue-500 uppercase">PRODUCTOS</a>
            <a href="/resenas" className="hover:text-blue-500 uppercase">RESEÑAS</a>
            <a href="/recibos" className="hover:text-blue-500 uppercase">RECIBOS</a>
            {/* <a href="/Ofertas" className="hover:text-blue-500 uppercase">OFERTAS</a>
            <a href="/cupones" className="hover:text-blue-500 uppercase">CUPONES</a> */}
          </div>
        </div>
      </nav>

      <div className="w-full max-w-7xl px-4 mb-8 flex justify-start">
        <a
          href="/landing"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver Modo Usuario
        </a>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Users className="w-12 h-12 text-blue-500 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Usuarios Totales</p>
                <h3 className="text-2xl font-bold">{stats.usuarios}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Package className="w-12 h-12 text-green-500 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Productos</p>
                <h3 className="text-2xl font-bold">{stats.productos}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <DollarSign className="w-12 h-12 text-yellow-500 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Ventas Totales</p>
                <h3 className="text-2xl font-bold">{stats.ventas}</h3>
              </div>
            </div>
          </div>

          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <Star className="w-12 h-12 text-purple-500 mr-4" />
              <div>
                <p className="text-sm text-gray-400">Reseñas</p>
                <h3 className="text-2xl font-bold">{stats.resenas}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Compras Diarias Chart */}
        <div className="bg-[#1E293B] rounded-lg p-6 text-white mb-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Compras Diarias</h2>
              <p className="text-gray-400">
                {periodoCompras 
                  ? `Registro de ventas por ${periodoCompras === 'mes' ? 'mes' : 'semana'}`
                  : 'Registro de todas las ventas'
                }
              </p>
            </div>
            <SelectorPeriodo />
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filtrarComprasPorPeriodo(comprasDiarias)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="fecha" 
                  stroke="#9CA3AF"
                  tick={{fill: '#9CA3AF', fontSize: 12}}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#9CA3AF"
                  tick={{fill: '#9CA3AF'}}
                  label={{ 
                    value: 'Cantidad', 
                    angle: -90, 
                    position: 'insideLeft',
                    fill: '#9CA3AF' 
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#9CA3AF"
                  tick={{fill: '#9CA3AF'}}
                  label={{ 
                    value: ' ', 
                    angle: 90, 
                    position: 'insideRight',
                    fill: '#9CA3AF' 
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value, name) => {
                    if (name === "total") {
                      return [`$${value.toFixed(2)}`, "Monto Total"];
                    }
                    return [value, "Total De Compras"];
                  }}
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="cantidad"
                  name="Total De Compras"
                  fill="#3B82F6"
                  stroke="#3B82F6"
                  fillOpacity={0.3}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="total"
                  name="Monto Total"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ventas Mensuales */}
        <div className="bg-[#1E293B] rounded-lg p-6 text-white mb-8 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ventas Mensuales</h2>
              <p className="text-gray-400">Total de ventas por mes</p>
            </div>
            <div>
              <select
                value={anioVentas}
                onChange={(e) => setAnioVentas(Number(e.target.value))}
                className="bg-gray-700 rounded px-2 py-1"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filtrarVentasMensuales(ventasPorMes)}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Area type="monotone" dataKey="total" name="Total de Ventas" fill="url(#colorVentas)" stroke="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filtrarVentasMensuales(ventasPorMes)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="mes" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Bar dataKey="cantidad" name="Cantidad de Ventas" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-center lg font-bold">Productos por Categoría</h2>
              </div>
              <div>
                <select
                  value={categoriaSeleccionada}
                  onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                  className="bg-gray-700 rounded px-2 py-1"
                >
                  <option value="">Todas las categorías</option>
                  {productosPorCategoria.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filtrarProductosPorCategoria(productosPorCategoria)}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {productosPorCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#216a8f', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock de Productos */}
          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Stock de Productos</h2>
                <p className="text-sm text-gray-400">Productos con menor stock</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Stock min"
                  value={stockMin}
                  onChange={(e) => setStockMin(e.target.value)}
                  className="bg-gray-700 rounded px-2 py-1 text-white w-24"
                />
                <input
                  type="number"
                  placeholder="Stock max"
                  value={stockMax}
                  onChange={(e) => setStockMax(e.target.value)}
                  className="bg-gray-700 rounded px-2 py-1 text-white w-24"
                />
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filtrarStockProductos(stockProductos)}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="nombre" type="category" stroke="#9CA3AF" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="stock" fill="#3B82F6">
                    {stockProductos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock <= 10 ? '#EF4444' : '#3B82F6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Evolución de Usuarios y Reseñas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Evolución de Usuarios y Reseñas</h2>
                <p className="text-sm text-gray-400">Últimos 6 meses</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucionUsuarios}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#9CA3AF"
                    tick={{fill: '#9CA3AF'}}
                  />
                  <YAxis 
                    yAxisId="left" 
                    stroke="#9CA3AF"
                    tick={{fill: '#9CA3AF'}}
                    label={{ 
                      value: 'Cantidad', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#9CA3AF' 
                    }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    stroke="#9CA3AF"
                    tick={{fill: '#9CA3AF'}}
                    label={{ 
                      value: 'Acumulado', 
                      angle: 90, 
                      position: 'insideRight',
                      fill: '#9CA3AF' 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="usuarios"
                    name="Nuevos Usuarios"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    yAxisId="left"
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resenas"
                    name="Nuevas Reseñas"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    yAxisId="left"
                    dot={{ fill: '#8B5CF6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line type="monotone"
                    dataKey="usuarios_acumulados"
                    name="Total Usuarios"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    yAxisId="right"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="resenas_acumuladas"
                    name="Total Reseñas"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    yAxisId="right"
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Distribución de Calificaciones y Registro por Género */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribución de Calificaciones */}
          <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Distribución de Calificaciones</h2>
                <p className="text-sm text-gray-400">Análisis de satisfacción del cliente</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribucionResenas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="calificacion" 
                    stroke="#9CA3AF"
                    label={{ 
                      value: 'Calificación', 
                      position: 'insideBottom', 
                      offset: -5,
                      fill: '#9CA3AF' 
                    }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    label={{ 
                      value: 'Cantidad de Reseñas', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#9CA3AF' 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                    formatter={(value, name, props) => {
                      if (name === "cantidad") {
                        return [`${value} reseñas`, "Cantidad"];
                      }
                      if (name === "porcentaje") {
                        return [`${value}%`, "Porcentaje"];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="cantidad" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  >
                    {distribucionResenas.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.calificacion >= 4 ? '#10B981' : entry.calificacion >= 3 ? '#F59E0B' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="porcentaje" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Registro de Usuarios por Género */}
          {/* <div className="bg-[#1E293B] rounded-lg p-6 text-white shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">Registro de Usuarios por Género</h2>
                <p className="text-sm text-gray-400">Últimos 6 meses</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrosPorGenero}>
                  <defs>
                    <linearGradient id="colorMasculino" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFemenino" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOtro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="mes" 
                    stroke="#9CA3AF"
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    label={{ 
                      value: 'Número de Registros', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#9CA3AF' 
                    }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      color: '#fff' 
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="masculino"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorMasculino)"
                  />
                  <Area
                    type="monotone"
                    dataKey="femenino"
                    stroke="#EC4899"
                    fillOpacity={1}
                    fill="url(#colorFemenino)"
                  />
                  <Area
                    type="monotone"
                    dataKey="otro"
                    stroke="#8B5CF6"
                    fillOpacity={1}
                    fill="url(#colorOtro)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default HomeAdmin;