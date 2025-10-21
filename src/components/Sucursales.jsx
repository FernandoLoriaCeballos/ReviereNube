import React, { useState } from "react";
import Inventario from "./InventarioSucursal";
import "./Sucursales.css";

function Sucursales() {
    const [sucursalId, setSucursalId] = useState(1);

    return (
        <div className="sucursales-container">
            <h1>Inventarios por sucursales</h1>
            <select
                className="sucursales-select"
                onChange={(e) => setSucursalId(Number(e.target.value))}
                value={sucursalId}
            >
                <option value={0}>Todas</option>
                <option value={1}>Sucursal 1</option>
                <option value={2}>Sucursal 2</option>
                <option value={3}>Sucursal 3</option>
            </select>

            <div className="inventario-section">
                {/* tarjeta responsiva que imita el layout de Productos.jsx */}
                <div className="inventario-card">
                    <div className="table-responsive">
                        <Inventario sucursalId={sucursalId} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Sucursales;
