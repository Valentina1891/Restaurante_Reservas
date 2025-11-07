import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { Container, Card, Field } from "../components/Kit";

/**
 * MisReservas
 * - Crea reservas
 * - Lista del usuario
 * - Permite cancelar
 * - Permite EDITAR (fecha, hora, personas, notas) en línea
 */
export default function MisReservas() {
  const nav = useNavigate();

  // listado + feedback
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // formulario de creación
  const [form, setForm] = useState({ fecha: "", hora: "", personas: 2, notas: "" });

  // edición en línea
  const [editing, setEditing] = useState(null); // _id de la reserva en edición
  const [buffer, setBuffer] = useState({});     // copia editable

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/reservas/mias");
      setItems(Array.isArray(data) ? data : (data.items || []));
      setErr("");
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
      await api.post("/api/reservas", form);
      setForm({ fecha: "", hora: "", personas: 2, notas: "" });
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo crear");
    }
  };

  /* ==================== Cancelar ==================== */
  const cancelar = async (id) => {
    try {
      await api.post(`/api/reservas/${id}/cancelar`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo cancelar");
    }
  };

  /* ==================== Editar ==================== */
  const startEdit = (r) => {
    // arranca edición solo si está activa
    if (r.estado !== "activa") return;
    setEditing(r._id);
    // clona valores actuales a buffer
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
    setErr("");
  };

  const saveEdit = async () => {
    try {
      setErr("");
      const { _id, ...payload } = buffer;
      // normaliza personas a número (por si viene como string del input)
      if (payload.personas != null) payload.personas = Number(payload.personas);
      await api.put(`/api/reservas/${editing}`, payload);
      cancelEdit();
      load();
    } catch (e) {
      // 400 → validación (formato fecha/hora, pasado, etc.)
      // 409 → conflicto de horario por índice único
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
                {/* Si está en edición → muestra form en línea */}
                {editing === r._id ? (
                  <div style={{ width: "100%" }}>
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
                  // Modo lectura
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>
                        {r.fecha} {r.hora}
                      </div>
                      <div className="muted">
                        {r.personas} personas — {r.estado}
                      </div>
                      {r.notas && <div style={{ marginTop: 4 }}>{r.notas}</div>}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {r.estado === "activa" && (
                        <>
                          <button className="btn" onClick={() => startEdit(r)}>
                            Editar
                          </button>
                          <button className="btn danger" onClick={() => cancelar(r._id)}>
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </li>
            ))}

            {!loading && !items.length && (
              <div className="muted">Aún no tienes reservas</div>
            )}
          </ul>
        </Card>
      </div>
    </Container>
  );
}
