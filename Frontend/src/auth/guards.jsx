// src/auth/guards.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;                 // spinner si quieres
  if (!user) return <Navigate to="/login" replace />; // si /me falló → fuera
  return children;
}

export function RequireRole({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.roles?.includes(role)) return <Navigate to="/403" replace />;
  return children;
}
export function RoleGate({ anyOf = [], children }) {
  const { user } = useAuth();
  return user && anyOf.some(r => user.roles?.includes(r)) ? children : null;
}
