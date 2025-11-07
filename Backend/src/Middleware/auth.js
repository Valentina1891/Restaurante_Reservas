// Middleware/auth.js
// -----------------------------------------------------------
// Middleware para proteger rutas con JWT y roles.
// Lee el token desde cookie httpOnly ("access_token") o desde
// el header Authorization: Bearer <token> (útil para Postman).
// Normaliza req.user = { id, roles, ... }.
// -----------------------------------------------------------

const jwt = require("jsonwebtoken");

// Usa SIEMPRE la misma SECRET que usas en el login.
// (Mantén el nombre de la env variable consistente)
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/**
 * Extrae el token desde cookie o header Authorization.
 * Devuelve null si no encuentra nada.
 */
function getTokenFromReq(req) {
  // 1) Cookie httpOnly puesta en el login
  const fromCookie = req.cookies?.access_token;
  if (fromCookie) return fromCookie;

  // 2) Header Bearer para pruebas con Postman o apps móviles
  const auth = req.headers["authorization"] || "";
  if (auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }

  return null;
}

/**
 * requireAuth
 * - Verifica el JWT.
 * - Normaliza el payload para que siempre tengas: req.user = { id, roles, ... }
 *   Notar que en tu login firmas el token con "sub" como id del usuario:
 *     jwt.sign({ sub: u._id, roles: u.roles }, ...)
 *   Aquí convertimos "sub" -> "id" para que el resto del código sea expresivo.
 */
exports.requireAuth = (req, res, next) => {
  const token = getTokenFromReq(req);
  if (!token) return res.status(401).json({ msg: "No autorizado" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload esperado: { sub: <id>, roles: [...], iat, exp }

    // Normalizamos: req.user.id y req.user.roles
    req.user = {
      id: payload.sub,            // mapeamos sub -> id
      roles: payload.roles || [], // por si el token no trae roles
      // puedes añadir campos extra si los firmas (correo, nombre, etc.)
    };

    return next();
  } catch (err) {
    // Si el token es inválido o expiró -> 401
    return res.status(401).json({ msg: "Token inválido o expirado" });
  }
};

/**
 * requireRole("admin")
 * - Permite pasar solo si el usuario posee el rol requerido.
 * - Debe ejecutarse DESPUÉS de requireAuth (ya que usa req.user).
 */
exports.requireRole = (role) => (req, res, next) => {
  const roles = req.user?.roles || [];
  if (roles.includes(role)) return next();
  return res.status(403).json({ msg: "No autorizado" });
};

/**
 * requireAnyRole("admin","manager",...)
 * - Pasa si el usuario tiene al menos UNO de los roles indicados.
 */
exports.requireAnyRole = (...rolesRequeridos) => (req, res, next) => {
  const roles = req.user?.roles || [];
  const ok = rolesRequeridos.some((r) => roles.includes(r));
  if (ok) return next();
  return res.status(403).json({ msg: "No autorizado" });
};

/**
 * requireSelfOrRole("admin")
 * - Útil para endpoints tipo:
 *   GET /users/:id , PATCH /users/:id , GET /orders/:userId
 * - Permite si el usuario autenticado es el mismo del parámetro
 *   (por defecto usa req.params.id) o tiene el rol indicado.
 *
 *   Puedes pasar un selector de parámetro si tu ruta usa otro nombre:
 *   requireSelfOrRole("admin", paramName="userId")
 */
exports.requireSelfOrRole = (role, paramName = "id") => (req, res, next) => {
  const roles = req.user?.roles || [];
  const isAdmin = roles.includes(role);

  // id del usuario autenticado (del token)
  const myId = String(req.user?.id || "");

  // id objetivo que viene en la ruta
  const targetId = String(req.params?.[paramName] || "");

  if (isAdmin || (myId && targetId && myId === targetId)) {
    return next();
  }
  return res.status(403).json({ msg: "No autorizado" });
};
