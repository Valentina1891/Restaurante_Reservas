/**
 * Pequeño "UI kit" reutilizable.
 * - Evita repetir <div class="card">...</div> en cada página
 * - Deja todo muy explícito con comentarios para cambiar rápido más adelante
 */
export function Container({ children }) {
  return <div className="container">{children}</div>;
}
export function Card({ title, subtitle, children, footer }) {
  return (
    <div className="card">
      {title && <div className="h2">{title}</div>}
      {subtitle && <div className="muted" style={{marginBottom:12}}>{subtitle}</div>}
      {children}
      {footer && <div style={{marginTop:14}}>{footer}</div>}
    </div>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label style={{display:"grid", gap:6}}>
      <span className="muted">{label}</span>
      {children}
      {hint && <small className="muted">{hint}</small>}
    </label>
  );
}
