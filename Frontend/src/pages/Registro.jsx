// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import { Card, Container, Field } from "../components/Kit";

/**
 * Registro:
 * - Llama a /api/auth/register
 * - Si resulta → opcional: auto login (aquí redirijo a /login para simplificar)
 * - Validación básica en el cliente (no reemplaza la del backend)
 */
export default function Register(){
  const [form, setForm] = useState({ nombre:"", correo:"", rut:"", telefono:"", password:"" });
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const nav = useNavigate();

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    // validaciones mínimas (el backend hará las reales)
    if(!form.nombre || !form.correo || !form.rut || !form.password){
      setErr("Todos los campos marcados son obligatorios");
      return;
    }
    try{
      await api.post("/api/auth/register", form);
      setOk("Cuenta creada. Ahora puedes ingresar.");
      // Tip: si prefieres auto-login, llama a /auth/login y redirige directo
      setTimeout(()=> nav("/login"), 800);
    }catch(e){
      setErr(e?.response?.data?.msg || "No se pudo crear la cuenta");
    }
  };

  return (
    <Container>
      <Card title="Crear cuenta" subtitle="Regístrate para poder reservar">
        <form className="form" onSubmit={onSubmit}>
          <Field label="Nombre *">
            <input className="input" value={form.nombre} onChange={e=>set("nombre", e.target.value)} placeholder="Tu nombre"/>
          </Field>
          <Field label="Correo *">
            <input className="input" value={form.correo} onChange={e=>set("correo", e.target.value)} placeholder="tu@correo.com"/>
          </Field>
          <Field label="RUT *">
            <input className="input" value={form.rut} onChange={e=>set("rut", e.target.value)} placeholder="12.345.678-5"/>
          </Field>
          <Field label="Teléfono">
            <input className="input" value={form.telefono} onChange={e=>set("telefono", e.target.value)} placeholder="+56 9 ..."/>
          </Field>
          <Field label="Contraseña *">
            <input className="input" type="password" value={form.password} onChange={e=>set("password", e.target.value)} placeholder="••••••••"/>
          </Field>

          {err && <div className="muted" style={{color:"var(--danger)"}}>{err}</div>}
          {ok &&  <div className="muted" style={{color:"var(--ok)"}}>{ok}</div>}
          <button className="btn">Crear cuenta</button>
          <div className="muted">¿Ya tienes cuenta? <Link to="/login">Ingresar</Link></div>
        </form>
      </Card>
    </Container>
  );
}
