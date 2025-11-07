// Routers/admin.js
const express = require("express");
const admin = express.Router();

// Middlewares de seguridad
const { requireAuth, requireRole } = require("../Middleware/auth");

// Controladores de admin/comidas
const { createComida, updateComida, deleteComida, listComida } = require("../Controllers/comida_control");

// Controladores de admin/reservas
const { listReservasAdmin, updateReserva, capacidadPorSlot,getReservaDetalle } = require("../Controllers/admin_control");

// Utilidad para capturar errores async
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Validación simple de ObjectId
const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id));

/**
 * Todo este router queda protegido:
 * - requireAuth: exige JWT válido (cookie o Authorization Bearer)
 * - requireRole("admin"): exige rol administrador
 */
admin.use(requireAuth, requireRole("admin"));

// -------------------- COMIDAS (ABM) --------------------
// Crear comida
admin.post("/comidas", asyncHandler(createComida));

// Listar comidas (útil para panel de gestión)
admin.get("/comidas", asyncHandler(listComida));

// Actualizar comida
admin.put("/comidas/:id", asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: "id inválido" });
  }
  return updateComida(req, res, next);
}));

// Eliminar comida
admin.delete("/comidas/:id", asyncHandler(async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: "id inválido" });
  }
  return deleteComida(req, res, next);
}));

// -------------------- RESERVAS (vista admin) --------------------
// Listado general de reservas (con filtros por fecha/estado/slot, etc.)
/* 1) Rutas ESTÁTICAS / específicas primero */
const ensureObjectId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ msg: "id inválido" });
  }
  next();
};

/* 1) Rutas específicas SIEMPRE antes que las dinámicas */
admin.get("/reservas/capacidad", capacidadPorSlot);
admin.get("/reservas", listReservasAdmin);

/* 2) Rutas dinámicas con validación de :id */
admin.get("/reservas/:id", ensureObjectId, getReservaDetalle);   // opcional

module.exports = admin;
