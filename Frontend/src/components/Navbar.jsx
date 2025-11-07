// src/components/NavBar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { RoleGate } from "../auth/guards";

export default function NavBar(){
  const { user, logout } = useAuth();
  return (
    <div className="nav">
      {/* marca mínima */}
      <span style={{fontWeight:900, background:"linear-gradient(90deg,#22d3ee,#a78bfa)", WebkitBackgroundClip:"text", color:"transparent"}}>Pudu Restaurante</span>
      <Link to="/">Inicio</Link>
      <Link to="/menu">Menú</Link>
      {user && <Link to="/reservas">Mis reservas</Link>}
      <RoleGate anyOf={["admin"]}><Link to="/admin/comidas">Editar Menú</Link></RoleGate>
      <RoleGate anyOf={["admin"]}><Link to="/admin/reservas">Ver reservaciones</Link></RoleGate>
      <div style={{marginLeft:"auto", display:"flex", gap:8}}>
        {!user && <>
          <Link to="/login">Ingresar</Link>
          <Link to="/register">Registrarme</Link>
        </>}
        {user && <button className="btn secondary" onClick={logout}>Salir</button>}
      </div>
    </div>
  );
}
