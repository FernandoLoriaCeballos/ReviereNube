import { useEffect, useState } from "react";
import { embedDashboard } from "@preset-sdk/embedded";

const API_URL = import.meta.env.VITE_API_URL;

export default function HomeAdmin() {
  const [error, setError] = useState("");

  async function fetchGuestToken() {
    const resp = await fetch(`${API_URL}/api/v1/preset/guest-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_name: "5463ca90-3205-45be-a01a-d64d6f6ab767",
        api_secret: "3321324f5fbe4713aead9444eba1410b0313633ba88981ad3749693c1f2dd9b2",
        team_name: "165a4f44",
        workspace_name: "025175db",
        dashboard_id: "9eaf168a-2729-403e-81aa-eb6f7c488c9e",
        username: "auth0|693267f239cf93e2f1d92bc2",
        first_name: "sharis",
        last_name: "gomez"
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      throw new Error(data.error || "Error al obtener guest token");
    }

    return data.token;
  }

  useEffect(() => {
    async function load() {
      try {
        await embedDashboard({
          id: "9eaf168a-2729-403e-81aa-eb6f7c488c9e",
          supersetDomain: "https://025175db.us2a.app.preset.io",
          mountPoint: document.getElementById("preset-container"),
          fetchGuestToken,
          dashboardUiConfig: {},
          referrerPolicy: "strict-origin-when-cross-origin"
        });

        // Ajusta el iframe para ocupar todo el espacio
        setTimeout(() => {
          const iframe = document.querySelector("#preset-container iframe");
          if (iframe) {
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.minHeight = "100vh";
            iframe.style.border = "none";
            iframe.style.background = "#fff";
            iframe.style.display = "block";
          }
        }, 1000);
      } catch (err) {
        setError(err.message);
      }
    }

    load();
  }, []);

  return (
    <div className="bg-gray-50 font-['Montserrat'] min-h-screen">
      {/* Navbar actualizada */}
      <nav className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <a href="/" className="flex items-center">
            {/* Puedes agregar logo aquí si lo deseas */}
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
      <section className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        {/* Dashboard embebido */}
        <div
          id="preset-container"
          style={{
            width: "100vw",
            height: "100vh",
            minHeight: "100vh",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            justifyContent: "stretch",
            overflow: "hidden"
          }}
        >
          {error && (
            <div style={{
              color: "red",
              textAlign: "center",
              margin: "auto",
              fontWeight: 600,
              fontSize: "1.2rem",
              background: "#fff0f0",
              borderRadius: 8,
              padding: 32,
              boxShadow: "0 2px 8px rgba(239,68,68,0.08)"
            }}>
              {error}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
