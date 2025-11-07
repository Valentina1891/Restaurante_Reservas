const {Schema, model} = require("mongoose")

const UserSchema = new Schema ({
    nombre: { type: String, trim: true },
  correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
  rut:    { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, trim: true },
  roles: { type: [String], default: ["user"] },

  // CLAVE: define y guarda el hash aquí
  passwordHash: { type: String, required: true, select: false }
}, { timestamps: true})

module.exports=model("User",UserSchema,"Usuarios")