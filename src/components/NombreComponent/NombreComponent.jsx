import "./NombreComponent.css";
import { useState } from "react";

function NombreComponent(props) {
    const [getResponse, setGetResponse] = useState([]);

    const getData = async () => {
        try {
            const response = await fetch('https://rickandmortyapi.com/api/character');
            const jsonData = await response.json();
            setGetResponse(jsonData.results);
            console.log(jsonData.results);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <div style={{fontFamily: "Arial, sans-serif", padding: "20px", backgroundColor: "#f0f0f0"}}>
            <div style={{textAlign: "center"}}>
                <button
                    onClick={() => {
                        getData();
                    }}
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
            </div>
            <br />
            {getResponse && (
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
                        <tr style={{backgroundColor: "#007BFF", color: "white"}}>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Status</th>
                            <th>Especie</th>
                            <th>Foto</th>
                        </tr>
                    </thead>
                    <tbody>
                        {getResponse.map((character, index) => (
                            <tr key={index} style={{
                                borderBottom: "1px solid #ddd", 
                                backgroundColor: index % 2 === 0 ? "#f2f2f2" : "white",
                                padding: "20px"
                            }}>
                                <td>{character.id}</td>
                                <td>{character.name}</td>
                                <td>{character.status}</td>
                                <td>{character.species}</td>
                                <td><img src={character.image} alt={character.name} style={{width: "100px", height: "100px"}}/></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default NombreComponent;
