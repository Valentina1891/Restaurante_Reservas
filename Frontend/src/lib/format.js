export const formatCLP = (n) =>
  (Number.isFinite(n) ? n : Number(n || 0)).toLocaleString("es-CL", {
    style: "currency", currency: "CLP", maximumFractionDigits: 0
  });
