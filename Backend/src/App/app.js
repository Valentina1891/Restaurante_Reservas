// app.js
// ---------------------------
// App base de Express con:
// - JSON parser
// - Logs (morgan)
// - CORS con credenciales (cookies)
// - cookie-parser para leer la cookie "access_token"
// - Rutas públicas y rutas admin protegidas por JWT+roles
// ---------------------------

const express = require("express");
//cors comunicacion
const cors = require("cors");
const morgan = require("morgan");
//coockies
const cookieParser = require("cookie-parser");
// para usar npm dev run jsjs
require("dotenv").config();

// Routers
const router = require("../Routers/Routes");  // rutas públicas/mixtas
const admin = require("../Routers/admin");    // rutas de administración

// Middlewares de auth/roles
//para ver los roles , admin o user 
const { requireAuth, requireRole } = require("../Middleware/auth");

const app = express();

// ---------- Middlewares globales ----------
app.use(express.json());         // parsea JSON del body
app.use(morgan("dev"));          // logs de peticiones
app.use(cookieParser());         // habilita req.cookies

/**
 * CORS con credenciales:
 * - origin: el dominio del frontend (React/Vite/Next) que consumirá el backend
 * - credentials: true para permitir enviar/recibir cookies
 *
 * IMPORTANTE:
 *  - FRONTEND_URL debe ser algo como:
 *      http://localhost:5173   (Vite)
 *      http://localhost:3000   (Next/CRA)
 *  - En fetch/axios del front SIEMPRE usar credentials: "include"
 */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ---------- Rutas ----------
/**
 * Prefijo /api para tus rutas normales (públicas o protegidas individualmente).
 * Dentro de ese router puedes usar requireAuth por endpoint si lo necesitas.
 */
app.use("/api", router);

/**
 * Prefijo /api/admin protegido:
 * - requireAuth: exige JWT válido (desde cookie o header Bearer)
 * - requireRole("admin"): exige rol admin
 *
 * De esta forma TODO lo que cuelga de /api/admin queda sólo para admins:
 *   POST   /api/admin/products
 *   PATCH  /api/admin/products/:id
 *   DELETE /api/admin/products/:id
 *   GET    /api/admin/users
 * etc.
 */
app.use("/api/admin", requireAuth, requireRole("admin"), admin);

// ---------- Manejo básico de errores ----------
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  const status = err.status || 500;
  res.status(status).json({ msg: err.message || "Error interno" });
});

module.exports = app;
