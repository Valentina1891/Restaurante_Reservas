const Reservas =require("../Models/reservas")
const mongoose = require("mongoose")
//Agregar reserva
const createReserva = async(req,res,next)=>{
    try{
        const{
            fecha,
            hora,
            personas,
            notas
        }= req.body || {}
        if (!fecha || !hora || !personas) return res.status(400).json({ msg: "fecha, hora y personas son obligatorios" });
       
        const r = await Reservas.create({
            userId :req.user.id,
            fecha,hora,
            personas: Number(personas),
            notas
        })
        //Cuando se crea algo se utiliza el status 201 + location
        res.status(201).location(`/api/reservas/${r._id}`).json({ msg: "Reserva creada", reserva: r })
    }catch(err){
        if (err?.code === 11000) return res.status(409).json({ msg: "Ya tienes una reserva en ese horario" })
            next(err)
    }
}

//MIS RECERVAS
const listaReservas = async(req,res,next)=>{
    try{
        const items= await Reservas.find({userId:req.user.id}).sort({fecha:1,hora:1}).lean()
        if (!items){
            return res.status(404).json({msg:`El usuario ${req.user.id} no tiene reservas`})
        }
        res.json({items})
    }catch(err){
        next(err)
    }
}

//Actualizar recerva

// util simple: valida "YYYY-MM-DD" y "HH:mm"
const isYYYYMMDD = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ""));
const isHHmm     = (s) => /^\d{2}:\d{2}$/.test(String(s || ""));

const updateReserva = async (req, res, next) => {
  try {
    const { id } = req.params;                       // id de la reserva a editar
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ msg: "id inválido" });
    }

    // 1) Whitelist de campos editables por el usuario
    const allow = new Set(["personas", "notas", "fecha", "hora"]);
    const $set = {};
    for (const [k, v] of Object.entries(req.body || {})) {
      if (!allow.has(k)) continue;
      $set[k] = k === "personas" ? Number(v) : v;
    }

    // 2) Validaciones de negocio
    //    - personas mínimas/máximas (ajusta el tope según tu local)
    if ($set.personas != null) {
      if (!Number.isFinite($set.personas) || $set.personas < 1 || $set.personas > 12) {
        return res.status(400).json({ msg: "personas debe estar entre 1 y 12" });
      }
    }

    //    - formatos de fecha/hora si vienen
    if ($set.fecha != null && !isYYYYMMDD($set.fecha)) {
      return res.status(400).json({ msg: "fecha inválida (usa YYYY-MM-DD)" });
    }
    if ($set.hora  != null && !isHHmm($set.hora)) {
      return res.status(400).json({ msg: "hora inválida (usa HH:mm)" });
    }

    //    - no permitir editar reservas en el pasado (opcional, pero recomendado)
    //      si no envían nueva fecha/hora, validamos contra la guardada actual
    const reservaActual = await Reservas.findById(id).select("userId fecha hora estado");
    if (!reservaActual) return res.status(404).json({ msg: "Reserva no encontrada" });

    // sólo el dueño puede editar y debe estar activa
    if (String(reservaActual.userId) !== String(req.user.id)) {
      return res.status(403).json({ msg: "No autorizado" });
    }
    if (reservaActual.estado !== "activa") {
      return res.status(400).json({ msg: "Solo se pueden editar reservas activas" });
    }

    const fechaTarget = $set.fecha ?? reservaActual.fecha;
    const horaTarget  = $set.hora  ?? reservaActual.hora;

    // bloquea edición de reservas en el pasado
    // (ajusta zona horaria según tu server)
    const dtTarget = new Date(`${fechaTarget}T${horaTarget}:00`);
    const ahora = new Date();
    if (dtTarget < ahora) {
      return res.status(400).json({ msg: "No puedes mover la reserva a un horario pasado" });
    }
    //Bloque de anticipacion, no puede editar la reserva en menos de 1r de ella 
    const MINUTOS_ANTICIPACION = Number(process.env.MIN_EDIT_MINUTES ?? 60);
    if (dtTarget.getTime() - ahora.getTime() < MINUTOS_ANTICIPACION * 60 * 1000) {
    return res.status(400).json({ msg: `Solo puedes editar con ${MINUTOS_ANTICIPACION} min de anticipación` });
    }
    // 3) Ejecutar update
    //    - Usamos findOneAndUpdate con filtro por _id + userId + estado
    //    - El índice único (userId, fecha, hora) evitará doble booking del mismo usuario
    const r = await Reservas.findOneAndUpdate(
      { _id: id, userId: req.user.id, estado: "activa" },
      { $set },
      { new: true, runValidators: true }
    );

    if (!r) return res.status(404).json({ msg: "No encontrado" });

    // 4) Responder
    return res.json({ msg: "Reserva actualizada", reserva: r });
  } catch (err) {
    // 11000 → índice único (userId, fecha, hora): ya tiene otra reserva en ese horario
    if (err?.code === 11000) {
      return res
        .status(409)
        .json({ msg: "Conflicto: ya tienes otra reserva en ese horario" });
    }
    return next(err);
  }
};


//Cancelar recerva
const cancelarReserva  = async(req,res,next)=>{
    try{
        const {id} = req.params //id de la reserva
        const r = await Reservas.findByIdAndUpdate(
            {_id:id ,userId:req.user.id},
            {$set:{estado:"cancelado"}},
            {new:true})
        if (!r) return res.status(404).json({msg:"No encontrada o ya cancelada"})
    }catch(err){
        next(err)
    }
}


module.exports = {createReserva,listaReservas,updateReserva,cancelarReserva}