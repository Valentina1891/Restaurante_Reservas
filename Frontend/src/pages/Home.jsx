// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import Carousel from "../components/Carousel";
import { Container, Card } from "../components/Kit";

/**
 * ⚙️ Ajusta tus datos del local aquí (sin tocar el resto del componente)
 * Si no tienes el embed de Google Maps, deja GOOGLE_MAPS_EMBED_URL en "" y se mostrará solo un link.
 */
const SITE = {
  NAME: "Pudu Restaurante",
  ADDRESS_TEXT: "Av. Siempre Viva 123, Santiago, Chile",
  MAPS_LINK: "https://www.google.com/maps/search/?api=1&query=Av.+Siempre+Viva+123+Santiago+Chile",
  GOOGLE_MAPS_EMBED_URL: "", // opcional: pega tu <iframe src> de Google Maps aquí (solo la URL)
  PHONE_E164: "+56912345678",        // para tel:/WhatsApp
  PHONE_HUMAN: "+56 9 1234 5678",    // formato legible
  EMAIL: "contacto@pudu.cl",
  HOURS: [
    { day: "Lun–Jue", time: "12:00 – 22:00" },
    { day: "Vie–Sáb", time: "12:00 – 00:00" },
    { day: "Domingo", time: "12:00 – 18:00" },
  ],
};

export default function Home() {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 👇 importante: el backend filtra con ?destacados=true (no "destacado")
        const { data } = await api.get("/api/menu", {
          params: { destacado: true, limit: 6 },
        });
        const urls = (data.items || [])
          .map((x) => x.imgURL)
          .filter(Boolean);

        setSlides(urls.length ? urls : PLACEHOLDER);
      } catch {
        setSlides(PLACEHOLDER);
      }
    })();
  }, []);

  return (
    <Container>
      {/* ---- Hero simple con copy + CTAs ---- */}
      <Card>
        <div className="h1" style={{ margin: 0 }}>
          Bienvenido a {SITE.NAME}
        </div>
        <p className="muted" style={{ margin: "6px 0 14px" }}>
          Cocina de temporada, ingredientes frescos y un espacio para compartir.
        </p>

        {/* CTAs principales */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="btn" href="/menu">Ver menú</a>
          <a className="btn secondary" href="/reservas">Reservar mesa</a>
        </div>
      </Card>

      {/* ---- Carrusel de platos destacados ---- */}
      <div style={{ marginTop: 16 }}>
        <Carousel images={slides} height={420} interval={3500} />
      </div>

      {/* ---- Información del local: dirección, horario, contacto ---- */}
      <div className="grid" style={{ marginTop: 16 }}>
        {/* Dirección & Mapa */}
        <Card title="Dónde estamos" subtitle={SITE.ADDRESS_TEXT}>
          {/* Mapa embebido (si tienes URL de iframe). Si no, se muestra un botón a Google Maps */}
          {SITE.GOOGLE_MAPS_EMBED_URL ? (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,.08)" }}>
              <iframe
                title="Mapa"
                src={SITE.GOOGLE_MAPS_EMBED_URL}
                style={{ width: "100%", height: 240, border: 0, display: "block" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <a className="btn" href={SITE.MAPS_LINK} target="_blank" rel="noreferrer" style={{ marginTop: 8 }}>
              Abrir en Google Maps
            </a>
          )}
        </Card>

        {/* Horario de atención */}
        <Card title="Horario" subtitle="Atendemos toda la semana">
          <ul className="list" style={{ marginTop: 8 }}>
            {SITE.HOURS.map(({ day, time }) => (
              <li key={day} className="item" style={{ justifyContent: "space-between" }}>
                <span>{day}</span>
                <strong>{time}</strong>
              </li>
            ))}
          </ul>
        </Card>

        {/* Contacto */}
        <Card title="Contacto" subtitle="Hablemos">
          <div className="list">
            <div className="item">
              <span className="muted">Teléfono</span>
              <a href={`tel:${SITE.PHONE_E164}`}>{SITE.PHONE_HUMAN}</a>
            </div>
            <div className="item">
              <span className="muted">WhatsApp</span>
              <a
                href={`https://wa.me/${SITE.PHONE_E164.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Escríbenos
              </a>
            </div>
            <div className="item">
              <span className="muted">Email</span>
              <a href={`mailto:${SITE.EMAIL}`}>{SITE.EMAIL}</a>
            </div>
          </div>
        </Card>
      </div>

      {/* ---- SEO local básico (opcional): JSON-LD con datos del negocio ---- */}
      <script
        type="application/ld+json"
        // Nota: JSON.stringify para evitar problemas de JSX
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            name: SITE.NAME,
            address: SITE.ADDRESS_TEXT,
            telephone: SITE.PHONE_E164,
            url: typeof window !== "undefined" ? window.location.origin : undefined,
            servesCuisine: "Chilena",
          }),
        }}
      />
    </Container>
  );
}

// Fallback si el backend no entrega imágenes
const PLACEHOLDER = [
  "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544025164-8192e091c7b9?q=80&w=1600&auto=format&fit=crop",
];
