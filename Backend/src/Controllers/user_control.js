// Controllers/auth.js
const jwt = require("jsonwebtoken");       // Para firmar/validar tokens JWT
const bcrypt = require("bcryptjs");        // Para hashear y comparar contraseñas
const User = require("../Models/User");    // Modelo de usuario (Mongoose)
const { ValidarRut, normalizarRut } = require("../utils/rut"); // Utilidades para RUT

// Clave para firmar JWT (en producción usa variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/**
 * Opciones de la cookie que entregará el JWT:
 * - httpOnly: JS del navegador no puede leerla (mitiga XSS)
 * - secure: solo por HTTPS; en local lo desactivamos
 * - sameSite: 'lax' mitiga CSRF sin romper navegación normal
 * - path: '/' la cookie aplica a toda la app
 * - maxAge: expira en 1 hora
 */
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // en localhost debe ser false
  sameSite: "lax",
  path: "/",
  maxAge: 1000 * 60 * 60, // 1h
};

/* ======================== REGISTER ======================== */
/**
 * Registra un nuevo usuario
 * Flujo:
 * 1) Normaliza y valida entradas
 * 2) Valida RUT (con la versión normalizada)
 * 3) Hashea la contraseña
 * 4) Crea usuario en DB
 * 5) Devuelve datos públicos del usuario
 */
const register = async (req, res, next) => {
  try {
    // Extraemos del body (si no viene, usamos objeto vacío para evitar crash)
    const { nombre, correo, rut, password, telefono } = req.body || {};

    // 1) Normalización defensiva (trim, lower, etc.)
    const nombreOk = String(nombre || "").trim();
    const correoOk = String(correo || "").toLowerCase().trim();
    const passOk   = String(password || "").trim();
    const rutN     = normalizarRut(rut); // quita puntos, valida formato base

    // 2) Validaciones mínimas (mensajes claros)
    if (!nombreOk) return res.status(400).json({ msg: "nombre requerido" });
    if (!correoOk) return res.status(400).json({ msg: "correo requerido" });
    if (!passOk)   return res.status(400).json({ msg: "password requerido" });

    // Valida RUT usando la versión normalizada
    if (!rutN || !ValidarRut(rutN)) {
      return res.status(400).json({ msg: "El rut debe ser valido" });
    }

    // 3) Hash de contraseña (12 rounds = equilibrio seguridad/tiempo)
    const passwordHash = await bcrypt.hash(passOk, 12);

    // 4) Crear usuario en Mongo
    const u = await User.create({
      nombre: nombreOk,
      correo: correoOk,
      rut: rutN,
      telefono: telefono ? String(telefono).trim() : undefined,
      passwordHash, // guardamos SOLO el hash, nunca el texto plano
    });

    // 5) Respuesta sin exponer datos sensibles
    return res
      .status(201)
      .json({ msg: "Usuario creado", user: { id: u._id, correo: u.correo, nombre: u.nombre } });
  } catch (err) {
    /**
     * Mongo error 11000 => conflicto por clave única (correo o rut ya existe)
     * Respondemos 409 Conflict para que el cliente lo maneje correctamente.
     */
    if (err?.code === 11000) {
      return res.status(409).json({ msg: "Correo o RUT ya registrado" });
    }
    // Delega manejo a middleware de errores
    return next(err);
  }
};

/* ========================= LOGIN ========================== */
/**
 * Inicia sesión
 * Flujo:
 * 1) Normaliza y valida entradas
 * 2) Busca usuario por correo (incluyendo el passwordHash con .select)
 * 3) Compara contraseña vs hash
 * 4) Si coincide, genera JWT y lo pone en cookie httpOnly
 * 5) Devuelve datos públicos del usuario
 */
const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body || {};

    // 1) Normalización
    const correoOk = String(correo || "").toLowerCase().trim();
    const passOk   = String(password || "").trim();

    if (!correoOk || !passOk) {
      return res.status(400).json({ msg: "correo y password requeridos" });
    }

    /**
     * 2) Traemos explícitamente el hash con .select("+passwordHash")
     * porque en el modelo está 'select:false' para protegerlo por defecto.
     */
    const u = await User.findOne({ correo: correoOk }).select("+passwordHash");

    // Si el usuario no existe o no tiene hash, devolvemos credenciales inválidas
    if (!u || !u.passwordHash) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    // 3) Comparamos la contraseña (texto) con el hash almacenado
    const ok = await bcrypt.compare(passOk, u.passwordHash);
    if (!ok) return res.status(401).json({ msg: "Credenciales inválidas" });

    /**
     * 4) Generamos token JWT:
     *  - sub: sujeto del token (id del usuario)
     *  - roles: roles para autorización en endpoints protegidos
     *  - expiresIn: 1h (debe alinearse con maxAge de la cookie)
     */
    const token = jwt.sign(
      { sub: String(u._id), roles: u.roles || ["user"] },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Guardamos el token en una cookie segura (httpOnly)
    res.cookie("access_token", token, COOKIE_OPTS);

    // 5) Respondemos exitosamente con datos públicos
    return res.status(200).json({
      msg: "Login ok",
      user: { id: u._id, correo: u.correo, nombre: u.nombre },
    });
  } catch (err) {
    return next(err);
  }
};

/* ======================== LOGOUT ========================== */
/**
 * Cierra sesión
 * - Borra la cookie 'access_token' enviando una cookie vacía con el mismo path
 */
const logout = (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  return res.status(200).json({ msg: "Logout ok" });
};

// Exportamos handlers para usarlos en las rutas
module.exports = { register, login, logout };
