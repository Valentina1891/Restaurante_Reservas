import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // {id, correo, roles}
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get("/api/auth/me");
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null); // 401 → no logueado
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (correo, password) => {
    await api.post("/api/auth/login", { correo, password });
    const { data } = await api.get("/api/auth/me"); // refresca estado
    setUser(data.user);
  };

  const logout = async () => { await api.post("/api/auth/logout"); setUser(null); };

  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);
