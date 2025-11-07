import axios from "axios";
import { config } from "dotenv";

export const API_BASE=
    (typeof window !=="undefined" && window.ENV?.API_URL ||
    import.meta.env?.VITE_API_URL ||
    "http://localhost:4000/api"

)

export const api =axios.create({
    baseURL : API_BASE,
    withCredentials:false,
    headers:{"Content-Type":"application/json"}
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;                 // ✅ SIEMPRE devolver config
  },
  (error) => Promise.reject(error) // ✅ y propagar errores
);


console.log("[API baseURL]",API_BASE)