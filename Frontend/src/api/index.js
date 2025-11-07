// src/api/index.js
import { api } from "../api/api";

// Auth (el back setea/borra la cookie)
export const AuthApi = {
  login: (correo, password) => api.post("/auth/login", { correo, password }),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"), // debe existir en el back (retorna { user })
};

// Público
export const MenuApi = {
  list: (params={}) => api.get("/menu", { params }),
};

// Usuario
export const ReservasApi = {
  mias: () => api.get("/reservas/mias"),
  crear: (payload) => api.post("/reservas", payload),
  modificar:(id) =>api.put(`/reservas/${id}`),
  cancelar: (id) => api.post(`/reservas/${id}/cancelar`),
};

// Admin
export const AdminApi = {
  comidas: {
    list: (params={}) => api.get("/admin/comidas", { params }),
  },
  reservas: {
    slots: (fecha) => api.get("/admin/reservas/capacidad", { params: { fecha } }),
  },
};
