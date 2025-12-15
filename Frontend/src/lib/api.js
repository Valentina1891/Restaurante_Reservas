// src/lib/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",          // usamos proxy de Vite en dev
  withCredentials: true,    // cookies httpOnly
  headers: { "Content-Type": "application/json" },
});
