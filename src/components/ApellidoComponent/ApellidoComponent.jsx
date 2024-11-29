import "./ApellidoComponent.css";

//*Nuestro componente
function ApellidoComponent(props){
 return (
    <div>
        <h1 className="text-green-500 font-bold text-sm">{props.apellido}</h1>
    </div>
 );
}

//* Debemos exportarlo

export default ApellidoComponent;