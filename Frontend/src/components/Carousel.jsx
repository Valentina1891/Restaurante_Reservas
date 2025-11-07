import { useEffect, useRef, useState } from "react";

/**
 * Carousel simple, sin dependencias:
 * - autoplay con pausa al pasar el mouse
 * - flechas (prev/next)
 * - indicadores (puntos)
 * - responsive (altura fija; cover)
 */
export default function Carousel({
  images = [],          // [{src, alt}] o strings
  interval = 3500,      // ms entre slides
  height = 420,         // alto del carrusel
  radius = 16,          // border-radius
}) {
  const [i, setI] = useState(0);
  const timer = useRef(null);
  const hover = useRef(false);

  const go = (n) => setI((p) => (p + n + images.length) % images.length);
  const to = (idx) => setI(idx);

  useEffect(() => {
    // autoplay con pausa en hover
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => { if (!hover.current) go(1); }, interval);
    return () => clearInterval(timer.current);
  }, [i, interval, images.length]);

  if (!images?.length) return null;

  // normaliza shape
  const list = images.map(img => typeof img === "string" ? { src: img, alt: "" } : img);

  return (
    <div
      style={{
        position:"relative", overflow:"hidden", borderRadius:radius,
        height, background:"#f3f4f6", boxShadow:"0 10px 22px rgba(0,0,0,.10)"
      }}
      onMouseEnter={() => (hover.current = true)}
      onMouseLeave={() => (hover.current = false)}
    >
      {/* pista */}
      <div
        style={{
          display:"flex", width:`${list.length * 100}%`,
          transform:`translateX(-${i * (100 / list.length)}%)`,
          transition:"transform .5s ease",
          height:"100%",
        }}
      >
        {list.map((img, idx) => (
          <div key={idx} style={{ width:`${100 / list.length}%`, height:"100%" }}>
            <img
              src={img.src}
              alt={img.alt || `slide-${idx}`}
              onError={(e)=> e.currentTarget.src = "https://picsum.photos/1200/800?blur=2"}
              style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            />
          </div>
        ))}
      </div>

      {/* flechas */}
      <button
        aria-label="Anterior"
        onClick={() => go(-1)}
        style={btnStyles("left")}
      >‹</button>
      <button
        aria-label="Siguiente"
        onClick={() => go(1)}
        style={btnStyles("right")}
      >›</button>

      {/* indicadores */}
      <div style={{
        position:"absolute", bottom:12, left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:8, background:"rgba(255,255,255,.65)", padding:"6px 10px",
        borderRadius:999
      }}>
        {list.map((_, idx) => (
          <span
            key={idx}
            onClick={() => to(idx)}
            style={{
              width:10, height:10, borderRadius:"50%", cursor:"pointer",
              background: idx === i ? "#ef4444" : "rgba(0,0,0,.2)"
            }}
          />
        ))}
      </div>
    </div>
  );
}

function btnStyles(side){
  return {
    position:"absolute", top:"50%", transform:"translateY(-50%)",
    [side]:10, width:38, height:38, borderRadius:"50%",
    border:"0", background:"rgba(255,255,255,.8)", cursor:"pointer",
    fontSize:22, fontWeight:900, lineHeight:"38px",
    boxShadow:"0 6px 16px rgba(0,0,0,.2)"
  };
}
