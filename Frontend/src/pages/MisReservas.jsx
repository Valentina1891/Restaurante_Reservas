// pages/MisReservas.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Container, Card, Field } from "../components/Kit";

/**
 * MisReservas
 * - Crea reservas (fecha, hora, personas, notas)
 * - Lista reservas del usuario
 * - Permite cancelar
 * - Permite EDITAR en línea (fecha, hora, personas, notas) solo si está activa
 * - Estructura DOM estable para evitar errores de reconciliación
 */
export default function MisReservas() {
  const nav = useNavigate();

  // listado + feedback
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // formulario de creación
  const [form, setForm] = useState({ fecha: "", hora: "", personas: 2, notas: "" });

  // edición en línea
  const [editing, setEditing] = useState(null); // _id en edición
  const [buffer, setBuffer] = useState({});     // copia editable

  // Carga de reservas del usuario
  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/api/reservas/mias");
      setItems(Array.isArray(data) ? data : (data.items || []));
    } catch (e) {
      if (e?.response?.status === 401) return nav("/login");
      setItems([]);
      setErr(e?.response?.data?.msg || "Error al cargar reservas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* ==================== Crear ==================== */
  const crear = async () => {
    try {
      setErr("");
      await api.post("/reservas", form);
      setForm({ fecha: "", hora: "", personas: 2, notas: "" });
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo crear");
    }
  };

  /* ==================== Cancelar ==================== */
  const cancelar = async (id) => {
    try {
      setErr("");
      await api.post(`/reservas/${id}/cancelar`);
      // si estabas editando la misma, sal del modo edición
      if (editing === id) cancelEdit();
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo cancelar");
    }
  };

  /* ==================== Editar ==================== */
  const startEdit = (r) => {
    if (r.estado !== "activa") return;
    setEditing(r._id);
    setBuffer({
      _id: r._id,
      fecha: r.fecha,
      hora: r.hora,
      personas: r.personas,
      notas: r.notas || "",
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setBuffer({});
  };

  const saveEdit = async () => {
    try {
      setErr("");
      const { _id, ...payload } = buffer;
      if (payload.personas != null) payload.personas = Number(payload.personas);
      await api.put(`/reservas/${editing}`, payload);
      cancelEdit();
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo actualizar");
    }
  };

  return (
    <Container>
      <div className="grid">
        {/* ============ Crear ============ */}
        <Card title="Crear reserva" subtitle="Ingresa fecha y hora">
          <div className="form">
            <Field label="Fecha">
              <input
                className="input"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </Field>

            <Field label="Hora">
              <input
                className="input"
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              />
            </Field>

            <Field label="Personas">
              <input
                className="input"
                type="number"
                min={1}
                max={12}
                value={form.personas}
                onChange={(e) => setForm({ ...form, personas: Number(e.target.value) })}
              />
            </Field>

            <Field label="Notas">
              <input
                className="input"
                value={form.notas}
                onChange={(e) => setForm({ ...form, notas: e.target.value })}
              />
            </Field>

            {err && (
              <div className="muted" style={{ color: "var(--danger)" }}>
                {err}
              </div>
            )}

            <button className="btn" onClick={crear} disabled={loading}>
              Reservar
            </button>
          </div>
        </Card>

        {/* ============ Listado / Editar ============ */}
        <Card title="Mis reservas" subtitle="Puedes editar o cancelar reservas activas">
          {loading && <div className="muted">Cargando…</div>}

          <ul className="list">
            {items.map((r) => (
              <li key={r._id} className="item" style={{ alignItems: "flex-start" }}>
                {/* Mantén un wrapper estable dentro del LI para evitar reconciliación problemática */}
                <div style={{ flex: 1 }}>
                  {editing === r._id ? (
                    // ===== Modo edición =====
                    <div>
                      <div
                        className="grid"
                        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
                      >
                        <Field label="Fecha">
                          <input
                            className="input"
                            type="date"
                            value={buffer.fecha}
                            onChange={(e) => setBuffer({ ...buffer, fecha: e.target.value })}
                          />
                        </Field>

                        <Field label="Hora">
                          <input
                            className="input"
                            type="time"
                            value={buffer.hora}
                            onChange={(e) => setBuffer({ ...buffer, hora: e.target.value })}
                          />
                        </Field>

                        <Field label="Personas">
                          <input
                            className="input"
                            type="number"
                            min={1}
                            max={12}
                            value={buffer.personas}
                            onChange={(e) =>
                              setBuffer({ ...buffer, personas: Number(e.target.value) })
                            }
                          />
                        </Field>

                        <Field label="Notas">
                          <input
                            className="input"
                            value={buffer.notas}
                            onChange={(e) => setBuffer({ ...buffer, notas: e.target.value })}
                          />
                        </Field>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={saveEdit}>Guardar</button>
                        <button className="btn secondary" onClick={cancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    // ===== Modo lectura =====
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {r.fecha} {r.hora}
                      </div>
                      <div className="muted">
                        {r.personas} personas — {r.estado}
                      </div>
                      {r.notas && <div style={{ marginTop: 4 }}>{r.notas}</div>}
                    </div>
                  )}
                </div>

                {/* Acciones (contenedor fijo a la derecha) */}
                <div style={{ display: "flex", gap: 8 }}>
                  {r.estado === "activa" && editing !== r._id && (
                    <>
                      <button className="btn" onClick={() => startEdit(r)}>Editar</button>
                      <button className="btn danger" onClick={() => cancelar(r._id)}>Cancelar</button>
                    </>
                  )}
                </div>
              </li>
            ))}

            {/* Estado vacío como <li> (no usar <div> dentro de <ul>) */}
            {!loading && !items.length && (
              <li className="item">
                <div className="muted">Aún no tienes reservas</div>
              </li>
            )}
          </ul>

          {/* Mensaje de error bajo la lista (fuera del <ul>) */}
          {err && !loading && (
            <div className="muted" style={{ color: "var(--danger)", marginTop: 8 }}>
              {err}
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
}
