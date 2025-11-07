// pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login(){
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async e => {
    e.preventDefault();
    try { await login(correo, password); nav("/"); }
    catch (e) { setErr(e?.response?.data?.msg || "Error de inicio de sesión"); }
  };

  return (
    <form onSubmit={onSubmit} style={{display:"grid", gap:8, maxWidth:320}}>
      <h2>Ingresar</h2>
      {err && <small style={{color:"crimson"}}>{err}</small>}
      <input placeholder="correo" value={correo} onChange={e=>setCorreo(e.target.value)}/>
      <input placeholder="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
      <button>Entrar</button>
    </form>
  );
}
