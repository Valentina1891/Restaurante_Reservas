/**
 * Imagen con fallback: si falla la URL, muestra un placeholder bonito.
 */
export default function Img({ src, alt, className, style }) {
  const onErr = (e) => {
    e.currentTarget.src = "https://picsum.photos/600/400?blur=2"; // placeholder
  };
  return <img src={src} alt={alt} onError={onErr} className={className} style={style} />;
}
