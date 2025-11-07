// pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Container, Card, Field } from "../components/Kit"; // usa tus componentes base

export default function Login(){
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);     // ← mostrar/ocultar contraseña
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // Tu AuthContext usa login(correo, password)
      await login(correo, password);
      nav("/");
    } catch (e) {
      setErr(e?.response?.data?.msg || "Error de inicio de sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      {/* Centra la tarjeta en la vista */}
      <div className="auth-wrap">
        <Card title="Ingresar" subtitle="Accede a tu cuenta para reservar">
          <form className="form" onSubmit={onSubmit}>
            {/* Campo correo */}
            <Field label="Correo">
              <input
                className="input"
                type="email"
                placeholder="ej: usuario@correo.com"
                value={correo}
                onChange={(e)=> setCorreo(e.target.value)}
                autoComplete="email"
                required
              />
            </Field>

            {/* Campo contraseña con toggle mostrar/ocultar */}
            <Field label="Contraseña">
              <div className="field-password">
                <input
                  className="input"
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e)=> setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-eye"
                  onClick={()=> setShow(s => !s)}
                  aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={show ? "Ocultar" : "Mostrar"}
                >
                  {show ? "🙈" : "👁️"}  {/* usa un emoji simple; puedes cambiar por un ícono */}
                </button>
              </div>
            </Field>


            {/* Mensaje de error */}
            {err && (
              <div className="muted" style={{ color: "var(--danger)" }}>
                {err}
              </div>
            )}

            {/* Acción principal */}
            <button className="btn" disabled={loading}>
              {loading ? "Ingresando…" : "Entrar"}
            </button>

            {/* Enlaces útiles */}
            <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
              <Link to="/register" className="muted">¿No tienes cuenta? Regístrate</Link>
              {/* <Link to="/forgot" className="muted">Olvidé mi contraseña</Link> */}
            </div>
          </form>
        </Card>
      </div>
    </Container>
  );
}
