//
require("dotenv").config();
const port = parseInt(process.env.PORT || "3000",10)
const app = require("./src/App/app");
const {dbConexion} = require("./src/Data/db")

dbConexion().then(()=>{

app.listen(port,()=>{
    console.log(`Servidor escuchando en el puerto ${port}`)
});
}).catch((err)=>{
    console.error("Fallo al conectar a Mongo, no se levantó el server:", err?.message);
    process.exit(1);
})
