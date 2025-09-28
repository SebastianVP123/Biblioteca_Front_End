// src/pages/Profile.jsx
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Profile() {
   const { user, logout, updateUser } = useAuth();
   const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState('overview');
   const [isEditing, setIsEditing] = useState(false);
   const [editForm, setEditForm] = useState({
       nombre: '',
       apellido: '',
       correo: '',
       telefono: ''
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [stats, setStats] = useState({
    accountAge: 0,
    loginCount: 0,
    securityScore: 85
  });

  useEffect(() => {
    if (user?.createdAt) {
      const createdDate = new Date(user.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setStats(prev => ({ ...prev, accountAge: diffDays }));
    }
  }, [user]);

  // Inicializar formulario de edición cuando el usuario cambie
  useEffect(() => {
    if (user) {
      setEditForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        telefono: user.telefono || ''
      });
    }
  }, [user]);

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      correo: user?.correo || '',
      telefono: user?.telefono || ''
    });
    setError('');
    setSuccess('');
  };

  const saveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar campos requeridos
      if (!editForm.nombre.trim()) {
        setError('El nombre es obligatorio');
        return;
      }
      if (!editForm.correo.trim()) {
        setError('El correo electrónico es obligatorio');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.correo)) {
        setError('El correo electrónico no tiene un formato válido');
        return;
      }

      await updateUser({
        nombre: editForm.nombre.trim(),
        apellido: editForm.apellido.trim(),
        correo: editForm.correo.trim(),
        telefono: editForm.telefono.trim()
      });

      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const profileSections = [
    {
      id: 'overview',
      title: 'Resumen',
      icon: '👤',
      content: (
        <div className="profile-overview">
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.accountAge}</span>
              <span className="stat-label">Días registrado</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.securityScore}%</span>
              <span className="stat-label">Seguridad</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Activo</span>
              <span className="stat-label">Estado</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'personal',
      title: 'Información Personal',
      icon: '📋',
      content: (
        <div className="profile-personal">
          {/* Mensajes de error y éxito */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span>
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
              <span>✅</span>
              {success}
            </div>
          )}

          {isEditing ? (
            /* Formulario de edición */
            <div className="form-section" style={{ marginBottom: '2rem' }}>
              <div className="form-section-header">
                <h3 className="section-title">
                  <span className="section-icon">✏️</span>
                  Editando Información Personal
                </h3>
              </div>

              <div className="field-group">
                <div className="field-item">
                  <label className="field-label field-required">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={editForm.nombre}
                    onChange={handleEditInputChange}
                    className="field-input"
                    placeholder="Ingresa tu nombre"
                    required
                  />
                </div>

                <div className="field-item">
                  <label className="field-label">Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    value={editForm.apellido}
                    onChange={handleEditInputChange}
                    className="field-input"
                    placeholder="Ingresa tu apellido"
                  />
                </div>
              </div>

              <div className="field-group">
                <div className="field-item">
                  <label className="field-label field-required">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={editForm.correo}
                    onChange={handleEditInputChange}
                    className="field-input"
                    placeholder="Ingresa tu correo electrónico"
                    required
                  />
                </div>

                <div className="field-item">
                  <label className="field-label">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={editForm.telefono}
                    onChange={handleEditInputChange}
                    className="field-input"
                    placeholder="Ingresa tu teléfono"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  <span>💾</span>
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEditing}
                  disabled={loading}
                >
                  <span>❌</span>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            /* Vista de solo lectura */
            <div className="info-grid">
              <div className="info-item">
                <label className="info-label">Nombre completo</label>
                <div className="info-value">{user?.nombre} {user?.apellido}</div>
              </div>
              <div className="info-item">
                <label className="info-label">Correo electrónico</label>
                <div className="info-value">{user?.correo}</div>
              </div>
              <div className="info-item">
                <label className="info-label">Teléfono</label>
                <div className="info-value">{user?.telefono || 'No especificado'}</div>
              </div>
              <div className="info-item">
                <label className="info-label">Fecha de registro</label>
                <div className="info-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
              <div className="info-item">
                <label className="info-label">ID de usuario</label>
                <div className="info-value">#{user?._id || user?.id}</div>
              </div>
              <div className="info-item">
                <label className="info-label">Rol</label>
                <div className="info-value">{user?.rol === 'admin' ? 'Administrador' : 'Usuario'}</div>
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="form-actions" style={{ marginTop: '2rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={startEditing}
              >
                <span>✏️</span>
                Editar Información
              </button>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'security',
      title: 'Seguridad',
      icon: '🔒',
      content: (
        <div className="profile-security">
          <div className="security-status">
            <div className="security-item">
              <div className="security-icon">🔐</div>
              <div className="security-info">
                <h4>Contraseña</h4>
                <p>Última actualización: Hace {stats.accountAge} días</p>
                <button className="security-button">Cambiar contraseña</button>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon">📧</div>
              <div className="security-info">
                <h4>Verificación de email</h4>
                <p>Estado: Verificado ✅</p>
                <button className="security-button secondary">Reenviar verificación</button>
              </div>
            </div>
            <div className="security-item">
              <div className="security-icon">🛡️</div>
              <div className="security-info">
                <h4>Autenticación de dos factores</h4>
                <p>Estado: No configurado</p>
                <button className="security-button">Configurar 2FA</button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Preferencias',
      icon: '⚙️',
      content: (
        <div className="profile-preferences">
          <div className="preference-section">
            <h4>Notificaciones</h4>
            <div className="preference-item">
              <label className="preference-label">
                <input type="checkbox" defaultChecked />
                Recibir emails de seguridad
              </label>
            </div>
            <div className="preference-item">
              <label className="preference-label">
                <input type="checkbox" />
                Notificaciones de actividad
              </label>
            </div>
          </div>
          <div className="preference-section">
            <h4>Privacidad</h4>
            <div className="preference-item">
              <label className="preference-label">
                <input type="checkbox" defaultChecked />
                Perfil público
              </label>
            </div>
            <div className="preference-item">
              <label className="preference-label">
                <input type="checkbox" />
                Mostrar actividad
              </label>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="profile-page">
      <div className="container">
        {/* Header del Perfil */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            <div className="avatar-circle-large">
              {(user?.username || user?.name || 'U')[0].toUpperCase()}
            </div>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.username || user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              <span className="meta-item">Miembro desde {new Date(user?.createdAt).getFullYear()}</span>
              <span className="meta-item">Cuenta verificada</span>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <div className="profile-tabs">
          {profileSections.map((section) => (
            <button
              key={section.id}
              className={`tab-button ${activeTab === section.id ? 'active' : ''}`}
              onClick={() => setActiveTab(section.id)}
            >
              <span className="tab-icon">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>

        {/* Contenido de la pestaña activa */}
        <div className="profile-content">
          {profileSections.find(section => section.id === activeTab)?.content}
        </div>

        {/* Acciones rápidas */}
        <div className="profile-actions">
          <Link to="/dashboard" className="action-link primary">
            ← Volver al Dashboard
          </Link>
          <button onClick={handleLogout} className="action-link danger">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}