import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PRESET_GUEST_TOKEN_URL = "https://api.app.preset.io/v1/teams/165a4f44/workspaces/025175db/guest-token/";
const DASHBOARD_ID = "9eaf168a-2729-403e-81aa-eb6f7c488c9e";
const SUPERSET_DOMAIN = "https://025175db.us2a.app.preset.io";

export default function HomeAdmin() {
  const navigate = useNavigate();
  const [embedError, setEmbedError] = useState("");
  const [embedUrl, setEmbedUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmbed() {
      try {
        setLoading(true);
        // Llama directamente al endpoint de Preset Cloud
        const resp = await fetch(PRESET_GUEST_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Si necesitas autenticación, agrega el header Authorization aquí
          body: JSON.stringify({
            user: {
              username: "auth0|693267f239cf93e2f1d92bc2",
              first_name: "sharis",
              last_name: "gomez"
            },
            resources: [
              {
                type: "dashboard",
                id: DASHBOARD_ID
              }
            ],
            rls: []
          })
        });

        const data = await resp.json();

        if (!resp.ok || !data.token) {
          const backendError =
            data?.error?.message ||
            data?.error ||
            (data?.errors && Array.isArray(data.errors)
              ? data.errors.map(e => e.message).join(" | ")
              : JSON.stringify(data));
          throw new Error(backendError);
        }

        // Arma la URL del dashboard con el guest token
        const dashboardUrl = `${SUPERSET_DOMAIN}/superset/dashboard/${DASHBOARD_ID}/?standalone=1&guest_token=${data.token}`;
        setEmbedUrl(dashboardUrl);
        setEmbedError("");
      } catch (err) {
        setEmbedUrl("");
        setEmbedError(
          err.message?.includes("Not authorized")
            ? "No autorizado: Verifica permisos, dashboard_id y credenciales."
            : `Error al cargar el dashboard: ${err.message}`
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmbed();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <nav className="bg-white shadow-md border-b border-gray-200" style={{ position: "sticky", top: 0, zIndex: 100 }}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="hidden lg:flex items-center space-x-8">
            <a href="/homeadmin" className="text-gray-700 hover:text-red-500">DASHBOARD</a>
            <a href="/usuarios" className="text-gray-700 hover:text-red-500">USUARIOS</a>
            <a href="/productos" className="text-gray-700 hover:text-red-500">PRODUCTOS</a>
            <a href="/empresas" className="text-gray-700 hover:text-red-500">SUCURSALES</a>
            <a href="/sucursales" className="text-gray-700 hover:text-red-500">INVENTARIO(S)</a>
            <a href="/recibos" className="text-gray-700 hover:text-red-500">RECIBOS</a>
            <a href="/reporte-ventas" className="text-gray-700 hover:text-red-500">REPORTE DE VENTAS</a>
          </div>
        </div>
      </nav>  
      <button
        className="btn-regresar"
        onClick={() => navigate("/usuarios")}
        style={{
          position: "fixed",
          top: 24,
          left: 24,
          zIndex: 200,
          background: "linear-gradient(to right, #ef4444, #f97316)",
          color: "#fff",
          border: "none",
          padding: "10px 24px",
          borderRadius: "50px",
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(239,68,68,0.2)",
          fontSize: "1rem",
          transition: "all 0.3s"
        }}
        onMouseOver={e => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        Regresar
      </button>
      <div
        style={{
          width: "100%",
          height: "calc(100vh - 72px)",
          marginTop: "72px",
          background: "#fff",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "center"
        }}
      >
        {embedError ? (
          <div style={{
            color: "#b91c1c",
            textAlign: "center",
            margin: "auto",
            fontWeight: 600,
            fontSize: "1.2rem",
            maxWidth: 480,
            background: "#fff0f0",
            borderRadius: 8,
            padding: 32,
            boxShadow: "0 2px 8px rgba(239,68,68,0.08)"
          }}>
            {embedError}
          </div>
        ) : loading ? (
          <div style={{
            textAlign: "center",
            margin: "auto",
            color: "#444",
            fontWeight: 500,
            fontSize: "1.1rem"
          }}>
            Cargando dashboard...
          </div>
        ) : (
          embedUrl && (
            <iframe
              src={embedUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                background: "#fff"
              }}
              title="Dashboard Embed"
              allowFullScreen
            />
          )
        )}
      </div>
    </div>
  );
}
