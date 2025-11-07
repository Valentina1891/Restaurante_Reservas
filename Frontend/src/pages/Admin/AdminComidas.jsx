// src/pages/admin/AdminComidas.jsx
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Container, Card, Field } from "../../components/Kit";

/* Utilidad local para formatear CLP (evita crear otro archivo) */
const clp = (n) =>
  (Number.isFinite(n) ? n : Number(n || 0)).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  });

/**
 * AdminComidas
 * - Crea comidas con: nombre, precio, categoria, disponible, destacado, descripcion, imgURL
 * - Edita en línea cada fila (Guardar / Cancelar)
 * - Elimina comidas
 *
 * NOTAS:
 * - Coerción de tipos al enviar (precio:number, checks:boolean)
 * - Preview de imagen en crear y en editar
 * - Manejo simple de errores y de "loading"
 */
export default function AdminComidas() {
  /* ======== Estado general ======== */
  const [items, setItems] = useState([]);          // Lista de comidas
  const [loading, setLoading] = useState(true);    // Cargando listado
  const [err, setErr] = useState("");              // Mensaje de error global

  /* Formulario de creación (controlado) */
  const [form, setForm] = useState({
    nombre: "",
    precio: 0,
    categoria: "",
    disponible: true,
    destacado: false,
    descripcion: "",
    imgURL: "",
  });

  /* Edición inline */
  const [editing, setEditing] = useState(null); // _id en edición (null = ninguno)
  const [buffer, setBuffer] = useState({});     // Copia editable del item

  /* ======== Helpers ======== */

  // Carga/recarga el listado desde el backend
  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/admin/comidas");
      // backend puede devolver {items: [...] } o directamente [...]
      setItems(data.items || data || []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo cargar el menú.");
    } finally {
      setLoading(false);
    }
  };

  // Al montar el componente, trae datos
  useEffect(() => {
    load();
  }, []);

  // Coacciona/normaliza payload aceptado por el backend
  const toPayload = (obj) => ({
    nombre: String(obj.nombre || "").trim(),
    // precio siempre número; si llega vacío o NaN → 0
    precio: Number(obj.precio) || 0,
    categoria: String(obj.categoria || "").trim(),
    descripcion: String(obj.descripcion || "").trim(),
    imgURL: String(obj.imgURL || "").trim(),
    // checks en booleano real (por si llega "true"/"false")
    disponible: !!obj.disponible,
    destacado: !!obj.destacado,
  });

  /* ======== Crear ======== */
  const createItem = async () => {
    try {
      setErr("");
      const payload = toPayload(form);

      // Validación mínima en cliente (el backend sigue validando)
      if (!payload.nombre) return setErr("El nombre es obligatorio.");
      if (!Number.isFinite(payload.precio) || payload.precio <= 0)
        return setErr("El precio debe ser un número mayor a 0.");

      await api.post("/api/admin/comidas", payload);

      // Limpia el form y recarga
      setForm({
        nombre: "",
        precio: 0,
        categoria: "",
        disponible: true,
        destacado: false,
        descripcion: "",
        imgURL: "",
      });
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo crear el plato.");
    }
  };

  /* ======== Editar ======== */

  // Inicia modo edición clonando el item
  const startEdit = (c) => {
    setEditing(c._id);
    setBuffer({ ...c });
  };

  // Cancela edición y limpia buffer
  const cancelEdit = () => {
    setEditing(null);
    setBuffer({});
  };

  // Guarda cambios del buffer en backend
  const saveEdit = async () => {
    try {
      const payload = toPayload(buffer);
      await api.put(`/api/admin/comidas/${editing}`, payload);
      cancelEdit();
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo actualizar el plato.");
    }
  };

  /* ======== Eliminar ======== */
  const remove = async (id) => {
    if (!confirm("¿Eliminar este plato?")) return;
    try {
      await api.delete(`/api/admin/comidas/${id}`);
      load();
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo eliminar el plato.");
    }
  };

  /* ======== Render ======== */
  return (
    <Container>
      <Card title="Admin: Comidas" subtitle="Crea, edita o elimina platos del menú">
        {/* ---- Formulario de creación ---- */}
        <div className="grid">
          <div className="card">
            <div className="form">
              <Field label="Nombre">
                <input
                  className="input"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Lomo vetado"
                />
              </Field>

              <Field label="Precio">
                <input
                  className="input"
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
                  placeholder="Ej: 8900"
                />
                {/* Ayuda visual con precio formateado */}
                <small className="muted">Preview: {clp(form.precio)}</small>
              </Field>

              <Field label="Categoría">
                <input
                  className="input"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  placeholder="Ej: plato, entrada, postre…"
                />
              </Field>

              <Field label="Descripción">
                <textarea
                  className="input"
                  rows={3}
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Texto corto del plato"
                />
              </Field>

              <Field label="Imagen (imgURL)">
                <input
                  className="input"
                  value={form.imgURL}
                  onChange={(e) => setForm({ ...form, imgURL: e.target.value })}
                  placeholder="https://… .jpg/.png"
                />
                {/* Preview de imagen: se oculta si falla */}
                {form.imgURL && (
                  <img
                    src={form.imgURL}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    alt="preview"
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,.08)",
                      marginTop: 6,
                    }}
                  />
                )}
              </Field>

              {/* Switches */}
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(e) => setForm({ ...form, disponible: e.target.checked })}
                />
                Disponible
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                />
                Destacado (aparece en carrusel)
              </label>

              {/* Errores del formulario de creación */}
              {err && <div className="muted" style={{ color: "var(--danger)" }}>{err}</div>}

              <button className="btn" onClick={createItem}>Crear</button>
            </div>
          </div>

          {/* ---- Listado editable ---- */}
          <div className="card" style={{ gridColumn: "1/-1" }}>
            <div className="h2" style={{ margin: 0 }}>Listado</div>

            {loading && <div className="muted" style={{ marginTop: 8 }}>Cargando…</div>}

            <ul className="list" style={{ marginTop: 10 }}>
              {items.map((c) => (
                <li key={c._id} className="item" style={{ alignItems: "start" }}>
                  {/* === Modo edición === */}
                  {editing === c._id ? (
                    <div style={{ width: "100%" }}>
                      <div
                        className="grid"
                        style={{ gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))" }}
                      >
                        <Field label="Nombre">
                          <input
                            className="input"
                            value={buffer.nombre || ""}
                            onChange={(e) => setBuffer({ ...buffer, nombre: e.target.value })}
                          />
                        </Field>

                        <Field label="Precio">
                          <input
                            className="input"
                            type="number"
                            value={buffer.precio ?? 0}
                            onChange={(e) =>
                              setBuffer({ ...buffer, precio: Number(e.target.value) })
                            }
                          />
                          <small className="muted">Preview: {clp(buffer.precio)}</small>
                        </Field>

                        <Field label="Categoría">
                          <input
                            className="input"
                            value={buffer.categoria || ""}
                            onChange={(e) => setBuffer({ ...buffer, categoria: e.target.value })}
                          />
                        </Field>

                        <Field label="Descripción">
                          <textarea
                            className="input"
                            rows={2}
                            value={buffer.descripcion || ""}
                            onChange={(e) =>
                              setBuffer({ ...buffer, descripcion: e.target.value })
                            }
                          />
                        </Field>

                        <Field label="Imagen (imgURL)">
                          <input
                            className="input"
                            value={buffer.imgURL || ""}
                            onChange={(e) => setBuffer({ ...buffer, imgURL: e.target.value })}
                          />
                          {/* Preview en edición */}
                          {buffer.imgURL && (
                            <img
                              src={buffer.imgURL}
                              onError={(e) => (e.currentTarget.style.display = "none")}
                              alt="preview"
                              style={{
                                width: "100%",
                                height: 120,
                                objectFit: "cover",
                                borderRadius: 10,
                                border: "1px solid rgba(0,0,0,.08)",
                                marginTop: 6,
                              }}
                            />
                          )}
                        </Field>

                        {/* Checks */}
                        <div style={{ display: "grid", gap: 8 }}>
                          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={!!buffer.disponible}
                              onChange={(e) =>
                                setBuffer({ ...buffer, disponible: e.target.checked })
                              }
                            />
                            Disponible
                          </label>

                          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={!!buffer.destacado}
                              onChange={(e) =>
                                setBuffer({ ...buffer, destacado: e.target.checked })
                              }
                            />
                            Destacado
                          </label>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <button className="btn" onClick={saveEdit}>Guardar</button>
                        <button className="btn secondary" onClick={cancelEdit}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    /* === Modo lectura === */
                    <>
                      {/* Miniatura a la izquierda si hay imagen */}
                      {c.imgURL && (
                        <img
                          src={c.imgURL}
                          alt={c.nombre}
                          onError={(e) => (e.currentTarget.style.display = "none")}
                          style={{
                            width: 84,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 10,
                            marginRight: 12,
                            border: "1px solid rgba(0,0,0,.08)",
                          }}
                        />
                      )}

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>
                          {c.nombre} — {clp(c.precio)} — {String(c.disponible)}
                        </div>
                        <div className="muted">
                          {c.categoria || "—"} {c.destacado ? " • ⭐ Destacado" : ""}
                        </div>
                        {c.descripcion && <div style={{ marginTop: 6 }}>{c.descripcion}</div>}
                        {c.imgURL && (
                          <div className="muted" style={{ overflowWrap: "anywhere" }}>
                            {c.imgURL}
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" onClick={() => startEdit(c)}>Editar</button>
                        <button className="btn danger" onClick={() => remove(c._id)}>Eliminar</button>
                      </div>
                    </>
                  )}
                </li>
              ))}

              {!loading && !items.length && (
                <div className="muted">No hay comidas creadas.</div>
              )}
            </ul>
          </div>
        </div>
      </Card>
    </Container>
  );
}
