const mongoose = require("mongoose")

const dbConexion = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Conexion exitosa a mongoDB")
    }catch(err){
        throw new Error("Error a la hora de iniciar la base de datos")
    }
}

module.exports = {dbConexion}