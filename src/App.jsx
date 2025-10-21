import React from "react";
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from "react-router-dom";
import { CarritoProvider } from './CarritoContext';
import Registro from "./Registro";
import Login from "./Login";
import Usuarios from "./Usuarios";
import Productos from "./Productos";
import Resenas from "./Resenas";
import Catalogo from "./Catalogo";
import Recibos from "./Recibos";
import Landing from "./Landing";
import ComprasRealizadas from "./ComprasRealizadas";
import Inicio from "./Inicio";
import QuienesSomos from "./QuienesSomos";
import Contacto from "./Contacto";
import HomeAdmin from "./HomeAdmin"
import Cupones from "./Cupones";
import Carrito from "./Carrito";
import Ofertas from "./Ofertas"
import CuponesLanding from "./CuponesLanding"
import GenerarUsuarios from "./GenerarUsuarios";
import GenerarResenas from "./GenerarResenas";
import GenerarCompras from "./GenerarCompras";
import LoginEmpresa from "./LoginEmpresa";
import LoginEmpleado from "./LoginEmpleado";
import RegistroEmpresa from "./RegistroEmpresa";
import Empresas from "./Empresas"; // Agregar esta importación


import Sucursales from "./components/Sucursales"; //Marielle

const App = () => {
  return (
    <CarritoProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/resenas" element={<Resenas />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/recibos" element={<Recibos />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/compras" element={<ComprasRealizadas />} />
          <Route path="/Cupones" element={<Cupones />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/quienessomos" element={<QuienesSomos />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/HomeAdmin" element={<HomeAdmin />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/generar-usuarios" element={<GenerarUsuarios />} />
          <Route path="/Ofertas" element={<Ofertas />} />
          <Route path="/cuponeslanding" element={<CuponesLanding />} />
          <Route path="/generar-resenas" element={<GenerarResenas />} />
          <Route path="/generar-compras" element={<GenerarCompras />} />
          <Route path="/empresas" element={<Empresas />} /> {/* Agregar esta ruta */}


          {/*MARIELLE*/}
          <Route path="/sucursales" element={<Sucursales />} /> {/* Ruta para Sucursales */}


        </Routes>
      </Router>
    </CarritoProvider>
  );
};




export default App;