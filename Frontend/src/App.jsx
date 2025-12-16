// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { RequireAuth, RequireRole } from "./auth/guards";
import NavBar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Registro";      // ← NUEVA
import MenuPublico from "./pages/MenuPublico";
import MisReservas from "./pages/MisReservas";
import AdminComidas from "./pages/Admin/AdminComidas";
import AdminReservas from "./pages/Admin/AdminReservas";
import Forbidden from "./pages/Forbidden";
import Footer from "./components/Footer";

export default function App(){
  return (
    <>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/menu" element={<MenuPublico/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/403" element={<Forbidden/>}/>
        <Route path="/reservas" element={<RequireAuth><MisReservas/></RequireAuth>}/>
        <Route path="/admin/comidas" element={<RequireRole role="admin"><AdminComidas/></RequireRole>}/>
        <Route path="/admin/reservas" element={<RequireRole role="admin"><AdminReservas/></RequireRole>}/>
        {/* fallback */}
        <Route path="*" element={<Home/>} />
      </Routes>
      <Footer></Footer>
    </>
  );
}
