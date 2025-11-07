// Controllers/admin_control.js
// ----------------------------------------------------------
// Endpoints de administración para Reservas:
// - listReservasAdmin: listar con filtros (fecha, estado, correo, rut) + paginación
// - updateReserva: actualizar campos permitidos
// - capacidadPorSlot: agrega por (fecha, hora) para ver ocupación
// ----------------------------------------------------------

const Reservas = require("../Models/reservas");
const User = require("../Models/User");
const { normalizarRut } = require("../utils/rut");

// ⚠️ Usa SIEMPRE el nombre del campo que hay en tu Schema:
const USER_FIELD = "userId";

const listReservasAdmin = async (req, res, next) => {
  try {
    const {
      fecha,               // "YYYY-MM-DD"
      estado,              // "activa" | "cancelada"
      correo,              // correo del usuario
      rut,                 // RUT del usuario
      page = 1,
      pageSize = 20,
    } = req.query;

    // Filtro base sobre Reservas
    const filter = {};
    if (fecha) filter.fecha = fecha;
    if (estado) filter.estado = estado;

    // Si filtran por correo o rut → primero buscamos los users y luego filtramos por sus _id
    if (correo || rut) {
      const uf = {};
      if (correo) uf.correo = String(correo).toLowerCase().trim();
      if (rut) uf.rut = normalizarRut(rut);

      const users = await User.find(uf).select("_id").lean();
      const ids = users.map(u => u._id);
      // Si no hay matches, forzamos a devolver vacío sin romper la consulta
      filter[USER_FIELD] = { $in: ids.length ? ids : ["__none__"] };
    }

    // Paginación
    const skip = (Number(page) - 1) * Number(pageSize);

    // Consulta + conteo en paralelo
    const [items, total] = await Promise.all([
      Reservas.find(filter)
        .sort({ fecha: 1, hora: 1 })
        .skip(skip)
        .limit(Number(pageSize))
        .populate({               // 👈 populate en el path correcto
          path: USER_FIELD,
          select: "nombre correo rut",
        })
        .lean(),
      Reservas.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    // Log útil si vuelve a colarse un path malo
    console.error("listReservasAdmin error:", err?.message);
    return next(err);
  }
};



// Capacidad por Slot (sumas por fecha+hora)
const capacidadPorSlot = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    const match = { estado: "activa" };
    if (fecha) match.fecha = fecha;

    const agg = await Reservas.aggregate([
      { $match: match },
      {
        $group: {
          _id: { fecha: "$fecha", hora: "$hora" },
          personas: { $sum: "$personas" },
          reservas: { $sum: 1 },
        },
      },
      { $sort: { "_id.fecha": 1, "_id.hora": 1 } },
    ]);

    const items = agg.map(x => ({
      fecha: x._id.fecha,
      hora: x._id.hora,
      personas: x.personas,
      reservas: x.reservas,
    }));

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
};
// Controllers/admin_control.js
const getReservaDetalle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Trae la reserva + usuario completo (agrega más campos si quieres)
    const r = await Reservas.findById(id)
      .populate({
        path: "userId",
        select: "nombre correo rut telefono roles createdAt",
      })
      .lean();

    if (!r) return res.status(404).json({ msg: "Reserva no encontrada" });
    res.json({ reserva: r });
  } catch (err) { next(err); }
};



module.exports = { listReservasAdmin, capacidadPorSlot,getReservaDetalle };
