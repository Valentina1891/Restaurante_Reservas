// src/lib/api.js
import axios from "axios";

const base =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api"; // fallback si quisieras proxy en dev

export const api = axios.create({
  baseURL: base,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});
