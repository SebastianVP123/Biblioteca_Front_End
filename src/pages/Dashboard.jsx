// src/pages/Dashboard.jsx
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUsuarios, getLibros, getAutores, getPrestamos } from "../services/api";

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    daysSinceRegistration: 0,
    accountStatus: 'Activo',
    lastLogin: new Date().toLocaleDateString()
  });
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalAuthors: 0,
    totalBorrows: 0,
    activeBorrows: 0,
    loading: true
  });

  useEffect(() => {
    if (user?.createdAt) {
      const createdDate = new Date(user.createdAt);
      const today = new Date();
      const diffTime = Math.abs(today - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setStats(prev => ({ ...prev, daysSinceRegistration: diffDays }));
    }
  }, [user]);

  // Cargar estadísticas del sistema para administradores
  useEffect(() => {
    if (isAdmin()) {
      loadSystemStats();
    }
  }, [isAdmin]);

  const loadSystemStats = async () => {
    try {
      setSystemStats(prev => ({ ...prev, loading: true }));

      const [users, books, authors, borrows] = await Promise.allSettled([
        getUsuarios(),
        getLibros(),
        getAutores(),
        getPrestamos()
      ]);

      // Extraer datos considerando la nueva estructura con paginación
      const getDataArray = (result) => {
        if (result.status !== 'fulfilled') return [];
        const data = result.value;
        // Si tiene estructura de paginación, usar docs/array correspondiente
        if (data.usuarios) return data.usuarios;
        if (data.libros) return data.libros;
        if (data.autores) return data.autores;
        if (data.prestamos) return data.prestamos;
        // Si es array directo (fallback)
        return Array.isArray(data) ? data : [];
      };

      const usersArray = getDataArray(users);
      const booksArray = getDataArray(books);
      const authorsArray = getDataArray(authors);
      const borrowsArray = getDataArray(borrows);

      const totalUsers = usersArray.length;
      const totalBooks = booksArray.length;
      const totalAuthors = authorsArray.length;
      const totalBorrows = borrowsArray.length;
      const activeBorrows = borrowsArray.filter(borrow => borrow.estado === 'activo').length;

      setSystemStats({
        totalUsers,
        totalBooks,
        totalAuthors,
        totalBorrows,
        activeBorrows,
        loading: false
      });
    } catch (error) {
      console.error('Error cargando estadísticas del sistema:', error);
      setSystemStats(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const quickActions = [
    {
      title: 'Mi Perfil',
      description: 'Ver y editar mi información personal',
      icon: '👤',
      link: '/profile',
      color: 'primary'
    },
    {
      title: 'Libros',
      description: 'Explorar y gestionar el catálogo de libros',
      icon: '📚',
      link: '/books',
      color: 'secondary'
    },
    {
      title: 'Préstamos',
      description: 'Ver y gestionar mis préstamos',
      icon: '📖',
      link: '/borrow',
      color: 'info'
    },
    {
      title: 'Ayuda',
      description: 'Centro de ayuda y soporte',
      icon: '❓',
      link: '#',
      color: 'success'
    }
  ];

  const adminActions = [
    {
      title: '👥 Usuarios',
      description: 'Gestionar usuarios del sistema',
      link: '/user',
      stats: systemStats.totalUsers
    },
    {
      title: '📚 Libros',
      description: 'Administrar catálogo de libros',
      link: '/books',
      stats: systemStats.totalBooks
    },
    {
      title: '✍️ Autores',
      description: 'Gestionar autores registrados',
      link: '/authors',
      stats: systemStats.totalAuthors
    },
    {
      title: '📋 Préstamos',
      description: 'Controlar todos los préstamos',
      link: '/borrow',
      stats: systemStats.totalBorrows
    }
  ];

  return (
    <div className="page">
      <div className="container">
        {/* Header del Dashboard */}
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1 className="page-title">
              ¡Hola, <span style={{ color: 'var(--primary)' }}>{user?.nombre || user?.name}</span>! 👋
            </h1>
            <p className="page-subtitle">
              {isAdmin() ? 'Panel de administración del sistema' : 'Bienvenido de vuelta a tu panel de control'}
            </p>
          </div>
          <div className="user-avatar">
            <div className="avatar-circle">
              {(user?.nombre || user?.name || 'U')[0].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Estadísticas del Sistema (Solo Admin) */}
        {isAdmin() && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-content">
              <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span className="section-icon">📊</span>
                Resumen del Sistema
              </h2>
              {systemStats.loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="loading-spinner" style={{ display: 'inline-block', marginRight: '1rem' }}></div>
                  Cargando estadísticas...
                </div>
              ) : (
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: 'white' }}>
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3>{systemStats.totalUsers}</h3>
                      <p>Usuarios Totales</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #DAA520, #FFD700)', color: '#1a0f08' }}>
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <h3>{systemStats.totalBooks}</h3>
                      <p>Libros Registrados</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #CD853F, #D2691E)', color: 'white' }}>
                    <div className="stat-icon">✍️</div>
                    <div className="stat-content">
                      <h3>{systemStats.totalAuthors}</h3>
                      <p>Autores Registrados</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                      <h3>{systemStats.totalBorrows}</h3>
                      <p>Total Préstamos</p>
                    </div>
                  </div>
                  <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                    <div className="stat-icon">🔄</div>
                    <div className="stat-content">
                      <h3>{systemStats.activeBorrows}</h3>
                      <p>Préstamos Activos</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Estadísticas Personales */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.daysSinceRegistration}</h3>
              <p>Días registrado</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{stats.accountStatus}</h3>
              <p>Estado de cuenta</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔐</div>
            <div className="stat-content">
              <h3>Segura</h3>
              <p>Cuenta protegida</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📱</div>
            <div className="stat-content">
              <h3>Activo</h3>
              <p>Estado actual</p>
            </div>
          </div>
        </div>

        {/* Información del Usuario */}
        <div className="card">
          <div className="card-content">
            <h2 className="card-title">Información de la Cuenta</h2>
            <div className="user-details">
              <div className="detail-item">
                <span className="detail-label">Nombre completo:</span>
                <span className="detail-value">{user?.nombre || user?.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Correo electrónico:</span>
                <span className="detail-value">{user?.correo || user?.email}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de registro:</span>
                <span className="detail-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Último acceso:</span>
                <span className="detail-value">{stats.lastLogin}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación a Módulos */}
        <div className="quick-actions-section">
          <h2 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-icon">🧭</span>
            Navegación de Módulos
          </h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="action-card"
              >
                <div className="action-icon">{action.icon}</div>
                <div className="action-content">
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                </div>
                <div className="action-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Panel de Administración (Solo Admin) */}
        {isAdmin() && (
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div className="card-content">
              <h2 className="card-title" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <span className="section-icon">⚙️</span>
                Panel de Administración
              </h2>
              <div className="actions-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {adminActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="action-card"
                    style={{
                      background: 'linear-gradient(135deg, var(--bg-card), var(--bg-secondary))',
                      border: '2px solid var(--primary)',
                      padding: '1.5rem',
                      textAlign: 'center'
                    }}
                  >
                    <div className="action-icon" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {action.title.split(' ')[0]}
                    </div>
                    <div className="action-content">
                      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                        {action.title.split(' ').slice(1).join(' ')}
                      </h3>
                      <p style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>{action.description}</p>
                      <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--primary)',
                        background: 'var(--primary-light)',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'inline-block'
                      }}>
                        {action.stats}
                      </div>
                    </div>
                    <div className="action-arrow">→</div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actividad Reciente */}
        <div className="card">
          <div className="card-content">
            <h2 className="card-title">
              <span className="section-icon">📋</span>
              Actividad Reciente
            </h2>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">🔓</div>
                <div className="activity-content">
                  <p className="activity-text">Inicio de sesión exitoso</p>
                  <span className="activity-time">Hace unos momentos</span>
                </div>
              </div>
              {isAdmin() && systemStats.totalUsers > 0 && (
                <div className="activity-item">
                  <div className="activity-icon">👥</div>
                  <div className="activity-content">
                    <p className="activity-text">Sistema gestionando {systemStats.totalUsers} usuarios</p>
                    <span className="activity-time">Actividad actual</span>
                  </div>
                </div>
              )}
              {isAdmin() && systemStats.totalBooks > 0 && (
                <div className="activity-item">
                  <div className="activity-icon">📚</div>
                  <div className="activity-content">
                    <p className="activity-text">Biblioteca con {systemStats.totalBooks} libros disponibles</p>
                    <span className="activity-time">Estado actual</span>
                  </div>
                </div>
              )}
              <div className="activity-item">
                <div className="activity-icon">📧</div>
                <div className="activity-content">
                  <p className="activity-text">Cuenta verificada y activa</p>
                  <span className="activity-time">Hace {stats.daysSinceRegistration} días</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">🎉</div>
                <div className="activity-content">
                  <p className="activity-text">Bienvenido a la Biblioteca Digital</p>
                  <span className="activity-time">Hace {stats.daysSinceRegistration} días</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Cerrar Sesión */}
        <div className="logout-section">
          <button onClick={handleLogout} className="btn btn-error btn-lg">
            <span>🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;