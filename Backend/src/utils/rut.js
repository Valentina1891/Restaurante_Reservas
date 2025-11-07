function normalizarRut(rut){
    if (!rut) return null;
    rut = String(rut).trim().toUpperCase().replace(/\./g,"")
    //forzar gión
    const n = rut.match(/^(\d+)-?([\dK])$/)
    if (!n) return null;
    return `${n[1]}-${n[2]}`;
}

function ValidarRut(rut){
    rut = normalizarRut(rut)
    if (!rut) return false
    const [numStr, dv] = rut.split("-");
    let suma = 0, mult = 2;
    for (let i = numStr.length - 1; i >= 0; i--) {
        suma += Number(numStr[i]) * mult;
        mult = mult === 7 ? 2 : mult + 1;
    }
    const resto = 11 - (suma % 11);
    const dvCalc = resto === 11 ? "0" : resto === 10 ? "K" : String(resto);
    return dv === dvCalc;

}

module.exports ={normalizarRut,ValidarRut}