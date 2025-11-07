// Routers/Routes.js
const express = require("express");
const router = express.Router();

// Controladores
const { createReserva, updateReserva, listaReservas, cancelarReserva } = require("../Controllers/reservas_control");
const { register, login, logout } = require("../Controllers/user_control");
const {menu} = require("../Controllers/comida_control");

// Middlewares
const { requireAuth } = require("../Middleware/auth");

// Pequeña utilidad para capturar errores async y pasar a middleware de error
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/**
 * GET /api/auth/me
 * Devuelve el usuario autenticado desde el token (req.user).
 * OJO: req.user depende de lo que firmaste en el JWT (sub/roles/…).
 * Por defecto aquí devolvemos id y roles. Si quieres correo, fírmalo en el token.
 */
router.get(
  "/auth/me",
  requireAuth,
  (req, res) => {
    const { id, roles } = req.user || {};
    return res.json({ user: { id, roles } });
    // Si firmaste correo en el JWT: const { id, roles, correo } = req.user;
  }
);

// ---------------------- AUTH ----------------------

// Registro
router.post("/auth/register", asyncHandler(register));

// Login (setea cookie httpOnly con el JWT)
router.post("/auth/login", asyncHandler(login));

// Logout (limpia cookie)
router.post("/auth/logout", asyncHandler(logout));

// -------------------- RESERVAS (usuario) --------------------
/**
 * Nota: Todas requieren estar autenticado.
 * Se asume que los controladores usan req.user.id para filtrar "mis reservas".
 */

// Listar MIS reservas
router.get("/reservas/mias", requireAuth, asyncHandler(listaReservas));

// Crear una reserva
router.post("/reservas", requireAuth, asyncHandler(createReserva));

// Validación simple de ObjectId para rutas con :id
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id));

// Actualizar una reserva propia
router.put("/reservas/:id", requireAuth, updateReserva);

// Cancelar una reserva propia
router.post("/reservas/:id/cancelar", requireAuth, asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: "id inválido" });
  }
  return cancelarReserva(req, res, next);
}));

// -------------------- MENÚ (público) --------------------
// Catálogo de comidas visible sin autenticación
router.get("/menu", asyncHandler(menu));

module.exports = router;
