import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { embedDashboard } from "@superset-ui/embedded-sdk";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const SUPERSET_DOMAIN = import.meta.env.VITE_SUPERSET_DOMAIN || "http://localhost:8088";
const DASHBOARD_ID = import.meta.env.VITE_SUPERSET_RESOURCE_ID || "9b6e3665-11f8-4e27-8af7-7b132d5f4a55"; 

export default function HomeAdmin() {
  const mountRef = useRef(null);
  const navigate = useNavigate(); // NUEVO: hook para navegar al hacer click

  useEffect(() => {
    let cancelled = false;

    const getUrlParams = () => {
      try {
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        return Object.keys(params).length ? params : undefined;
      } catch {
        return undefined;
      }
    };

    const load = async () => {
      try {
        await embedDashboard({
          id: DASHBOARD_ID, 
          supersetDomain: SUPERSET_DOMAIN.replace(/\/$/, ""),
          mountPoint: mountRef.current,
          fetchGuestToken: async () => {
            try {
              // usar API_URL (tu backend) para pedir el guest token
              //const resp = await axios.get("http://localhost:3000/superset-token");
              const resp = await axios.get(`${API_URL}/superset-token`);
              const token = resp?.data?.token;
              if (!token) {
                console.error("/superset-token responded without token:", resp.data);
                const e = new Error("No guest token returned from backend");
                e.detail = resp.data;
                throw e;
              }
              return token; // devolver el guest token (string)
            } catch (err) {
              console.error("Error fetching guest token from backend:", err.response?.status ?? err.message, err.response?.data ?? "");
              const e = new Error("Failed to fetch guest token");
              e.detail = { status: err.response?.status ?? null, body: err.response?.data ?? err.message };
              throw e;
            }
          },
          dashboardUiConfig: {
            hideTitle: true,
            hideTab: false,
            filters: { visible: true, expanded: true },
            urlParams: getUrlParams(),
          },
          iframeSandboxExtras: ["allow-same-origin", "allow-scripts", "allow-popups", "allow-forms", "allow-top-navigation"],
          referrerPolicy: "same-origin",
        });

        if (!cancelled) console.log("Dashboard embebido correctamente.");
      } catch (err) {
        console.error("Error embebiendo dashboard:", err);
        const status = err.detail?.status ?? err.response?.status ?? null;
        const body = err.detail?.body ?? err.response?.data ?? err.message ?? "";
        if (status === 404) {
          alert("Error 404: /superset-token no encontrado en el backend. Implementa GET /superset-token (login -> guest_token).");
        } else {
          alert(`Error al cargar dashboard. Revisa consola. Detalle: status=${status} body=${JSON.stringify(body)}`);
        }
        console.warn("Si ves 'Refused to display' en consola revisa X-Frame-Options en Superset o la configuración del proxy.");
      }
    };

    load();

    return () => {
      cancelled = true;
      // opcional: limpiar mountPoint si es necesario
      try { if (mountRef.current) mountRef.current.innerHTML = ""; } catch {}
    };
  }, []);

  return (
    <>
      {/* --- NAV insertado --- */}
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

      {/* Estilos del botón inyectados localmente */}
      <style>{`
        /* --- BOTÓN REGRESAR --- */
        .boton-regreso-wrapper {
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 10010;
            margin-bottom: 20px;
            display: flex;
            justify-content: flex-end;
            padding: 0;
            background: transparent;
        }
        
        .btn-regresar {
            background: linear-gradient(to right, #ef4444, #f97316);
            color: white;
            border: none;
            padding: 10px 24px;
            border-radius: 50px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.95rem;
            box-shadow: 0 4px 6px rgba(239, 68, 68, 0.2);
        }
        
        .btn-regresar:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(239, 68, 68, 0.3);
            background: linear-gradient(to right, #dc2626, #ea580c);
        }
      `}</style>

      {/* NUEVO: botón regresar */}
      <div className="boton-regreso-wrapper">
        <button
          className="btn-regresar"
          onClick={() => navigate('/usuarios')}
        >
          Regresar
        </button>
      </div>

      {/* Ajustado: el contenedor ya no es full-screen fixed para que el nav quede visible.
          NAV_HEIGHT: ajustar si tu nav tiene otra altura (ej. 64 o 72). */}
      <div
        id="superset-container"
        ref={mountRef}
        style={{
          position: "relative",                // no fixed: queda en el flujo debajo del nav
          marginTop: "72px",                   // espacio bajo el nav (ajusta si tu nav es más alto)
          width: "100%",
          height: "calc(100vh - 72px)",        // ocupa el resto de la pantalla
          overflow: "hidden",
          background: "#fff",
          margin: 0,
          padding: 0,
          zIndex: 1,                            // bajo el botón que tiene z-index mayor
        }}
      />
    </>
  );
}
