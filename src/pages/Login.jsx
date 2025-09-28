// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { loginUsuario } from "../services/api";

const Login = () => {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Login con admin por defecto para pruebas (PRIMERO)
    if (correo === 'admin@biblioteca.com' && contrasena === 'admin123') {
      const defaultAdmin = {
        _id: 'admin-default-123',
        nombre: 'Administrador',
        correo: 'admin@biblioteca.com',
        rol: 'admin',
        createdAt: new Date().toISOString()
      };
      login(defaultAdmin);
      navigate("/dashboard");
      setLoading(false);
      return;
    }

    try {
      // Intentar login con API (MongoDB)
      const response = await loginUsuario({ correo, contrasena });

      if (response.usuario) {
        login(response.usuario);
        navigate("/dashboard");
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log("API no disponible, verificando usuarios locales");
    }

    // Verificar usuarios registrados en localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const user = registeredUsers.find(u => u.correo === correo && u.contrasena === contrasena);

    if (user) {
      const { contrasena: _, ...userWithoutPassword } = user;
      login(userWithoutPassword);
      navigate("/dashboard");
      setLoading(false);
      return;
    }

    setError("Credenciales incorrectas. Regístrate primero o usa admin@biblioteca.com / admin123 para pruebas");
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-section">
          <div className="form-section-header">
            <h1 className="section-title">
              <span className="section-icon">🔐</span>
              Iniciar Sesión
            </h1>
            <p className="section-description">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <div className="field-item">
                 <label htmlFor="correo" className="field-label field-required">
                    Correo Electrónico
                 </label>
                 <input
                    type="email"
                    id="correo"
                    name="correo"
                    className="field-input"
                    placeholder="Ingresa tu correo electrónico"
                    required
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                 />
              </div>

              <div className="field-item">
                <label htmlFor="contrasena" className="field-label field-required">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  className="field-input"
                  placeholder="Ingresa tu contraseña"
                  required
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                <span>🔐</span>
                {loading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>

          <div className="text-center" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                Regístrate aquí
              </Link>
            </p>
            <p>
              ¿Olvidaste tu contraseña?{' '}
              <Link to="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                Recupera tu contraseña
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;