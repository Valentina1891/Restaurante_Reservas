const {Schema,model}=require("mongoose")
const {timeStamp} = require("console")

const ComidaSchema = new Schema({
    nombre:{type:String, require:true},
    descripcion:{type:String, require:true},
    precio:{type:Number, require:true},
    categoria:{type:String, trim:true},
    disponible:{type:Boolean,default:true},
    imgURL:{type:String,require:true},
    destacado:{type:Boolean, default:false}
},{ timeStamp:true})
//Indices del esquema
ComidaSchema.index({ categoria: 1, disponible: 1 });

module.exports = model("Comida",ComidaSchema,"Comida")