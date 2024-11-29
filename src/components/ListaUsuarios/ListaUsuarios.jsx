import { useState } from "react";

function ListaUsuarios(props) {
    const [usuarios, setUsuarios] = useState([]);

    const getData = async () => {
        try {
            const response = await fetch('http://localhost:3000/usuarios');
            const data = await response.json();
            setUsuarios(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f0f0f0" }}>
            <button
                onClick={getData}
                style={{
                    margin: "10px", 
                    padding: "10px", 
                    fontSize: "16px", 
                    backgroundColor: "#007BFF", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "12px", 
                    cursor: "pointer"
                }}
                onMouseOver={e => e.target.style.backgroundColor = "#0056b3"}
                onMouseOut={e => e.target.style.backgroundColor = "#007BFF"}
            >
                GENERAR TABLA
            </button>
            <br />
            <br />
            {usuarios.length > 0 ? (
                <table style={{
                    width: "90%", 
                    borderCollapse: "collapse", 
                    fontFamily: "Arial, sans-serif",
                    margin: "auto",
                    boxShadow: "0 0 20px rgba(0,0,0,0.15)",
                    borderRadius: "12px",
                    overflow: "hidden"
                }}>
                    <thead>
                        <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Edad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map((usuario, index) => (
                            <tr key={index} style={{
                                borderBottom: "1px solid #ddd", 
                                backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                                padding: "20px"
                            }}>
                                <td>{usuario._id}</td>
                                <td>{usuario.name}</td>
                                <td>{usuario.email}</td>
                                <td>{usuario.age}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No hay usuarios para mostrar. Haz clic en el botón para cargar la tabla.</p>
            )}
        </div>
    );
}

export default ListaUsuarios;
