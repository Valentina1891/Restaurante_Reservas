// Controllers/comida_control.js
// ----------------------------------------------------------
// ABM de "Comida" (admin) y listado público de menú.
// - createComida: crea documento validando campos obligatorios
// - listComida: lista con filtros, paginación y orden (destacados primero)
// - updateComida: actualiza campos permitidos
// - deleteComida: elimina por id
// - menu: listado público (sólo disponibles)
// ----------------------------------------------------------

const Comida = require("../Models/comida");

// Crea comida (ADMIN)
const createComida = async (req, res, next) => {
  try {
    // Campos permitidos (lista blanca)
    const allow = new Set(["nombre", "precio", "descripcion", "categoria", "disponible", "imgURL", "destacado"]);

    // Construimos el payload validado y normalizado
    const data = {};
    /**
     * Recorre todas las parejas [k,v] del body:
     * - sólo acepta las claves permitidas
     * - si k === "precio", castea a Number
     */
    for (const [k, v] of Object.entries(req.body || {})) {
      if (!allow.has(k)) continue;
      data[k] = k === "precio" ? Number(v) : v;
    }

    // Validación mínima obligatoria
    if (!data.nombre || !Number.isFinite(data.precio)) {
      return res.status(400).json({ msg: "nombre y precio son obligatorios" });
    }

    const c = await Comida.create(data);
    return res.status(201).json({ msg: "Comida creada", comida: c });
  } catch (err) {
    return next(err);
  }
};

// Lista de comidas (ADMIN) con filtros y paginación
const listComida = async (req, res, next) => {
  try {
    /**
     * q:       búsqueda por nombre (regex case-insensitive)
     * categoria: filtro exacto
     * disponible: "true"/"false" → boolean
     * paginación: page, pageSize → skip/limit
     * orden:    destacados primero (-1), luego más recientes (createdAt desc)
     */
    const { q, categoria, disponible, page = 1, pageSize = 20 } = req.query;

    const filter = {};
    if (q) filter.nombre = { $regex: String(q).trim(), $options: "i" };
    if (categoria) filter.categoria = categoria;
    if (typeof disponible !== "undefined") {
      filter.disponible = String(disponible) === "true";
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    //Promise.all arreglo de promesas, devuelve el obj que cumple con todos los arreglos
    const [items, total] = await Promise.all([
      Comida.find(filter)
        .sort({ destacado: -1, createdAt: -1 })
        .skip(skip)
        .limit(Number(pageSize))
        .lean(),
      Comida.countDocuments(filter),
    ]);

    return res.json({
      items,
      total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    return next(err);
  }
};

// Modificar comida (ADMIN)
const updateComida = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lista blanca de campos editables
    const allow = new Set(["nombre", "descripcion", "precio", "categoria", "disponible", "imgURL", "destacado"]);

    // Construir $set con normalización
    const $set = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (!allow.has(k)) continue;
      $set[k] = k === "precio" ? Number(v) : v;
    }

    // OJO: findByIdAndUpdate requiere objeto update ({ $set })
    const c = await Comida.findByIdAndUpdate(
      id,
      { $set },
      { new: true, runValidators: true }
    );

    if (!c) return res.status(404).json({ msg: "Comida no encontrada" });
    return res.json({ msg: "Comida actualizada", comida: c });
  } catch (err) {
    return next(err);
  }
};

// Eliminar comida (ADMIN)
const deleteComida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await Comida.findByIdAndDelete(id);
    if (!r) return res.status(404).json({ msg: "Comida no encontrada" });
    return res.json({ msg: "Comida eliminada" });
  } catch (err) {
    return next(err);
  }
};

// Menú público (sólo items disponibles; destacados primero)
const menu = async (req, res, next) => {
 try {
    // ahora soporta: ?q=...&categoria=...&destacados=true&limit=5
    const { categoria, q, destacados, limit } = req.query;

    // Por defecto: sólo los disponibles
    const filter = { disponible: true };

    if (categoria) filter.categoria = categoria;
    if (q) filter.nombre = { $regex: String(q).trim(), $options: "i" };

    // NUEVO: si pasan destacados=true → sólo los destacados
    if (String(destacados).toLowerCase() === "true") {
      filter.destacado = true;
    }

    // Opcional: limitar cantidad (ej. sólo 6 para el carrusel)
    const top = Number(limit) > 0 ? Number(limit) : undefined;

    const query = Comida.find(filter)
      .sort({ destacado: -1, createdAt: -1 })
      .select("nombre imgURL precio categoria descripcion destacado"); // devuelve sólo lo necesario

    if (top) query.limit(top);

    const items = await query.lean();
    res.json({ items });
  } catch (err) { next(err); }
};

module.exports={menu,deleteComida,updateComida,listComida,createComida}
