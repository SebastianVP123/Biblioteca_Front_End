// src/routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  // Mostrar spinner mientras se inicializa la autenticación
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'var(--gradient-bg)'
      }}>
        <LoadingSpinner />
      </div>
    );
  }

  return user && isAdmin() ? children : <Navigate to="/dashboard" />;
};

export default AdminRoute;