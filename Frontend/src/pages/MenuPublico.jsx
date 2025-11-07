import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Container, Card, Field } from "../components/Kit";
import Img from "../components/Img";

/**
 * Menú público:
 * - Cards con imagen (imgURL) + precio + descripción
 * - Fallback si la imagen falla
 * - Búsqueda simple por nombre
 */
export default function MenuPublico(){
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");

  const load = async (params={}) => {
    const { data } = await api.get("/api/menu", { params });
    setItems(data.items || []);
  };

  useEffect(() => { load(); }, []);
  const buscar = () => load({ q });

  return (
    <Container>
      <Card title="Menú" subtitle="Descubre nuestros platos disponibles">
        <div className="grid" style={{alignItems:"start"}}>
          <div className="card">
            <Field label="Buscar">
              <input className="input" value={q} onChange={e=>setQ(e.target.value)} placeholder="lomo, pasta, empanada..." />
            </Field>
            <button className="btn" onClick={buscar}>Buscar</button>
          </div>

          {/* Catálogo en grilla */}
          <div className="grid cards" style={{gridColumn:"1/-1"}}>
            {items.map(i => (
              <div className="card media" key={i._id}>
                <Img src={i.imgURL} alt={i.nombre} className="card-img" />
                <div className="card-body">
                  <div className="h2" style={{margin:0}}>{i.nombre}</div>
                  <div className="muted">{i.categoria || "general"}</div>
                  <div className="price">${i.precio?.toLocaleString?.("es-CL") ?? i.precio}</div>
                  <div className="muted">{i.descripcion || "—"}</div>
                </div>
              </div>
            ))}
            {!items.length && <div className="muted">No hay resultados para tu búsqueda.</div>}
          </div>
        </div>
      </Card>
    </Container>
  );
}
