const {Schema,model, default: mongoose} = require("mongoose")
const { timeStamp } = require("console");

const ReservaSchema = new Schema({
    userId:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
    personas :{type:Number, require:true, min:1},
    fecha:{type:String, require:true},
    hora:{type:String, require:true},
    notas:{type:String},
    estado:{type:String, require:true,enum:["activa","cancelada"],default:"activa"}
},{timestamps:true})

ReservaSchema.index({UserId:1,fecha:1,hora:1},{unique:true})
module.exports = model("Reservas",ReservaSchema,"Reservas")
