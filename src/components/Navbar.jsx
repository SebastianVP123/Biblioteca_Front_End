// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">📚 Biblioteca Digital</Link>
        <div className="navbar-nav">
          <Link to="/" className="nav-link">Inicio</Link>

          {!user ? (
              <Link to="/login" className="nav-link">Iniciar sesión</Link>
            ) : (
              <>
                <Link to="/dashboard" className="nav-link">🏠 Dashboard</Link>
                <Link to="/books" className="nav-link">📚 Libros</Link>
                <Link to="/authors" className="nav-link">📖 Autores</Link>
                <Link to="/borrow" className="nav-link">📋 Préstamos</Link>
                <Link to="/returns" className="nav-link">📚 Devoluciones</Link>
                {isAdmin() && (
                  <Link to="/user" className="nav-link">👥 Usuarios</Link>
                )}
                <Link to="/profile" className="nav-link">👤 Perfil</Link>
              </>
            )}
        </div>
        <div className="navbar-actions">
          <ThemeToggle />
          {user && (
            <>
              <span className="text-gray">{user.nombre}</span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Cerrar sesión</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}