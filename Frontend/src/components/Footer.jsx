// src/components/Footer.jsx
import { BsInstagram, BsFacebook, BsTiktok, BsWhatsapp } from "react-icons/bs";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container py-4 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
        <div className="container" style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
        <small>© {new Date().getFullYear()} Pudu Restaurante</small>
        <small style={{opacity:.7}}>Hecho con ❤️ en Chile</small>
      

        <nav className="d-flex gap-3 fs-5" aria-label="Redes sociales">
          <a href="#" aria-label="Instagram" className="text-white-50" target="_blank" rel="noopener noreferrer">
            <BsInstagram />
          </a>
          <a href="#" aria-label="Facebook" className="text-white-50" target="_blank" rel="noopener noreferrer">
            <BsFacebook />
          </a>
          <a href="#" aria-label="TikTok" className="text-white-50" target="_blank" rel="noopener noreferrer">
            <BsTiktok />
          </a>
          <a href="#" aria-label="WhatsApp" className="text-white-50" target="_blank" rel="noopener noreferrer">
            <BsWhatsapp />
          </a>
        </nav>
        </div>
      </div>
    </footer>
  );
}
