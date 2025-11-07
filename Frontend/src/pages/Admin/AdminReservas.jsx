// src/pages/admin/AdminReservas.jsx
import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api";
import { Container, Card, Field } from "../../components/Kit";

/**
 * AdminReservas
 * - KPIs: total, activas, canceladas (sobre el dataset filtrado)
 * - Filtros básicos: fecha, estado
 * - Listado paginado
 * - Capacidad por slot (sumatoria de personas y #reservas por hora)
 * - Manejo de loading/error y comentarios paso a paso
 */
export default function AdminReservas() {
  /* ============= STATE ============= */
  const [items, setItems] = useState([]);                  // Reservas (según filtros)
  const [capacidad, setCapacidad] = useState([]);          // Agrupado por {fecha,hora}
  const [filtros, setFiltros] = useState({                 // Controles de filtro
    fecha: "",                                            // yyyy-mm-dd (string)
    estado: "",                                           // "", "activa", "cancelada"
  });
  const [loading, setLoading] = useState(false);           // Spinner de carga
  const [err, setErr] = useState("");                      // Mensaje de error

  /* Paginación simple en el front (si el backend no pagina) */
  const [page, setPage] = useState(1);
  const pageSize = 10;                                     // 10 filas por página
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const view = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page]
  );

  /* ============= LOADERS ============= */

  // Carga reservas según filtros
  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/api/admin/reservas", { params: filtros });
      setItems(data.items || []);
      // al cambiar el dataset, vuelve a la página 1
      setPage(1);
    } catch (e) {
      setErr(e?.response?.data?.msg || "No se pudo cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  // Carga capacidad por slot (personas/reservas por {fecha,hora})
  const loadCap = async () => {
    try {
      const { data } = await api.get("/api/admin/reservas/capacidad", {
        params: { fecha: filtros.fecha || undefined },
      });
      setCapacidad(data.items || []);
    } catch (e) {
      // Capacidad es accesorio: no cortamos la vista si falla
      console.warn("capacidad error:", e?.response?.data?.msg || e.message);
    }
  };

  // Carga inicial
  useEffect(() => {
    load();
    loadCap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo una vez al montar

  // Botón "Aplicar filtros" → recarga ambas fuentes
  const apply = async () => {
    await load();
    await loadCap();
  };

  /* ============= DERIVADOS (KPIs / Totales) ============= */

  // Métricas básicas (sobre items ya filtrados)
  const kpi = useMemo(() => {
    const total = items.length;
    const activas = items.filter((r) => r.estado === "activa").length;
    const canceladas = items.filter((r) => r.estado === "cancelada").length;
    return { total, activas, canceladas };
  }, [items]);

  // Totales de capacidad del día (si se pasó fecha)
  const totalCap = useMemo(
    () =>
      capacidad.reduce(
        (acc, x) => ({
          personas: acc.personas + (x.personas || 0),
          reservas: acc.reservas + (x.reservas || 0),
        }),
        { personas: 0, reservas: 0 }
      ),
    [capacidad]
  );

  /* ============= RENDER ============= */
  return (
    <Container>
      <Card title="Admin: Reservas" subtitle="Resumen y gestión">
        {/* ---- KPIs ---- */}
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}
        >
          <div className="card">
            <div className="h2" style={{ margin: 0 }}>
              Total
            </div>
            <div style={{ fontSize: 28, fontWeight: 900 }}>{kpi.total}</div>
          </div>
          <div className="card">
            <div className="h2" style={{ margin: 0 }}>
              Activas
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "var(--ok)" }}>
              {kpi.activas}
            </div>
          </div>
          <div className="card">
            <div className="h2" style={{ margin: 0 }}>
              Canceladas
            </div>
            <div
              style={{ fontSize: 28, fontWeight: 900, color: "var(--danger)" }}
            >
              {kpi.canceladas}
            </div>
          </div>
        </div>

        {/* ---- Filtros ---- */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="form">
            <Field label="Fecha">
              <input
                className="input"
                type="date"
                value={filtros.fecha}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha: e.target.value })
                }
              />
            </Field>

            <Field label="Estado">
              <select
                className="select"
                value={filtros.estado}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
              >
                <option value="">(todos)</option>
                <option value="activa">activa</option>
                <option value="cancelada">cancelada</option>
              </select>
            </Field>

            <button className="btn" onClick={apply}>
              Aplicar filtros
            </button>

            {/* Errores de carga de reservas */}
            {err && (
              <div className="muted" style={{ color: "var(--danger)" }}>
                {err}
              </div>
            )}
          </div>
        </div>

        {/* ---- Listado (paginado) ---- */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="h2" style={{ margin: 0 }}>
            Listado
          </div>

          {loading && <div className="muted" style={{ marginTop: 8 }}>Cargando…</div>}

          <ul className="list" style={{ marginTop: 8 }}>
            {view.map((r) => (
              <li key={r._id} className="item">
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {r.fecha} {r.hora} — {r.personas} pers. — {r.estado}
                  </div>
                  <div className="muted">
                    {/* populate("userId","nombre correo rut") en backend */}
                    {r.userId?.nombre} • {r.userId?.correo} • {r.userId?.rut}
                  </div>
                </div>
              </li>
            ))}

            {!loading && !items.length && (
              <div className="muted">No hay reservas con esos filtros.</div>
            )}
          </ul>

          {/* Controles de paginación */}
          {pages > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </button>
              <div className="muted">
                Página {page} de {pages}
              </div>
              <button
                className="btn secondary"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </div>

        {/* ---- Capacidad por slot ---- */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="h2" style={{ margin: 0 }}>
            Capacidad por horario {filtros.fecha && `— ${filtros.fecha}`}
          </div>

          {/* Resumen del día */}
          {!!capacidad.length && (
            <div className="muted" style={{ marginTop: 8 }}>
              Total día: <strong>{totalCap.personas}</strong> personas •{" "}
              {totalCap.reservas} reservas
            </div>
          )}

          <ul className="list" style={{ marginTop: 8 }}>
            {capacidad.map((x) => (
              <li key={`${x.fecha}-${x.hora}`} className="item">
                <div>
                  {x.fecha} {x.hora}
                </div>
                <div>
                  <strong>{x.personas}</strong> personas •{" "}
                  <span className="muted">{x.reservas} reservas</span>
                </div>
              </li>
            ))}
            {!capacidad.length && (
              <div className="muted">Sin datos para la fecha.</div>
            )}
          </ul>
        </div>
      </Card>
    </Container>
  );
}
