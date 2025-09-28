// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUsuario } from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
    apellido: "",
    direccion: "",
    genero: "",
    tipoIdentificacion: "",
    numeroIdentificacion: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
   e.preventDefault();
   setError("");
   setSuccess("");
   setLoading(true);

   // Validaciones
   if (formData.contrasena !== formData.confirmarContrasena) {
     setError("Las contraseñas no coinciden");
     setLoading(false);
     return;
   }

   if (formData.contrasena.length < 6) {
     setError("La contraseña debe tener al menos 6 caracteres");
     setLoading(false);
     return;
   }

   try {
     // Intentar crear usuario a través de la API (MongoDB)
     const userData = {
       nombre: formData.nombre,
       correo: formData.correo,
       telefono: formData.telefono || undefined,
       contrasena: formData.contrasena,
       apellido: formData.apellido || undefined,
       direccion: formData.direccion || undefined,
       genero: formData.genero || undefined,
       tipoIdentificacion: formData.tipoIdentificacion || undefined,
       numeroIdentificacion: formData.numeroIdentificacion || undefined
       // El rol por defecto 'user' se asigna automáticamente en el backend
     };

     await createUsuario(userData);

     setSuccess("¡Registro exitoso! Redirigiendo al login...");

     // Redirigir al login después de 2 segundos
     setTimeout(() => {
       navigate("/login");
     }, 2000);

   } catch (apiError) {
     console.log("API no disponible, guardando en localStorage:", apiError.message);

     // Fallback: guardar en localStorage si la API no está disponible
     try {
       const registeredUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');

       // Verificar si el correo ya existe
       const existingUser = registeredUsers.find(u => u.correo === formData.correo);
       if (existingUser) {
         setError("Ya existe una cuenta con este correo electrónico");
         setLoading(false);
         return;
       }

       // Crear nuevo usuario con ID único
       const newUser = {
         _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
         nombre: formData.nombre,
         correo: formData.correo,
         telefono: formData.telefono || undefined,
         contrasena: formData.contrasena,
         apellido: formData.apellido || undefined,
         direccion: formData.direccion || undefined,
         genero: formData.genero || undefined,
         tipoIdentificacion: formData.tipoIdentificacion || undefined,
         numeroIdentificacion: formData.numeroIdentificacion || undefined,
         rol: 'user',
         createdAt: new Date().toISOString()
       };

       registeredUsers.push(newUser);
       localStorage.setItem('appUsers', JSON.stringify(registeredUsers));

       setSuccess("¡Registro exitoso! Redirigiendo al login...");

       // Redirigir al login después de 2 segundos
       setTimeout(() => {
         navigate("/login");
       }, 2000);

     } catch (localStorageError) {
       console.error("Error guardando en localStorage:", localStorageError);
       setError("Error al registrar usuario. Inténtalo de nuevo.");
     }
   } finally {
     setLoading(false);
   }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="form-section">
          <div className="form-section-header">
            <h1 className="section-title">
              <span className="section-icon">👤</span>
              Crear Cuenta
            </h1>
            <p className="section-description">
              Regístrate para acceder a la biblioteca digital
            </p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <span>✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="field-group">
              <div className="field-item">
                <label className="field-label field-required">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="field-input"
                  placeholder="Ingresa tu nombre completo"
                  required
                  value={formData.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="field-item">
                <label className="field-label">
                  Apellido
                </label>
                <input
                  type="text"
                  name="apellido"
                  className="field-input"
                  placeholder="Ingresa tu apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-item">
                <label className="field-label field-required">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  name="correo"
                  className="field-input"
                  placeholder="tu@email.com"
                  required
                  value={formData.correo}
                  onChange={handleChange}
                />
              </div>

              <div className="field-item">
                <label className="field-label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono"
                  className="field-input"
                  placeholder="1234567890"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-item">
                <label className="field-label field-required">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="contrasena"
                  className="field-input"
                  placeholder="Mínimo 6 caracteres"
                  required
                  value={formData.contrasena}
                  onChange={handleChange}
                />
              </div>

              <div className="field-item">
                <label className="field-label field-required">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmarContrasena"
                  className="field-input"
                  placeholder="Repite tu contraseña"
                  required
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="field-group">
              <div className="field-item">
                <label className="field-label">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  className="field-input"
                  placeholder="Dirección completa"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>

              <div className="field-item">
                <label className="field-label">
                  Género
                </label>
                <select
                  name="genero"
                  className="field-input"
                  value={formData.genero}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar género</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>
            </div>

            <div className="field-group">
              <div className="field-item">
                <label className="field-label">
                  Tipo de Identificación
                </label>
                <select
                  name="tipoIdentificacion"
                  className="field-input"
                  value={formData.tipoIdentificacion}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="cc">Cédula de Ciudadanía</option>
                  <option value="ce">Cédula de Extranjería</option>
                  <option value="ti">Tarjeta de Identidad</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
              </div>

              <div className="field-item">
                <label className="field-label">
                  Número de Identificación
                </label>
                <input
                  type="text"
                  name="numeroIdentificacion"
                  className="field-input"
                  placeholder="Número de identificación"
                  value={formData.numeroIdentificacion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                <span>👤</span>
                {loading ? 'Registrando...' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          <div className="text-center" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <p>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;