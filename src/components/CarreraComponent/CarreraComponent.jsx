import "./CarreraComponent.css";

//*Nuestro componente
function CarreraComponent(props){
 return (
    <div>
        <h1 className="text-center text-blue-500 uppercase">{props.carrera}</h1>
    </div>
 );
}

//* Debemos exportarlo

export default CarreraComponent;