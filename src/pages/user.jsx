import React, { useState, useEffect } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Users = () => {
    const { isAdmin } = useAuth();
    const [form, setForm] = useState({
        nombre: '',
        correo: '',
        telefono: '',
        contrasena: '',
        rol: 'user',
        apellido: '',
        direccion: '',
        genero: '',
        tipoIdentificacion: '',
        numeroIdentificacion: ''
    });
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReports, setShowReports] = useState(false);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        if (isAdmin()) {
            loadUsers();
        }
    }, [isAdmin]);

    const loadUsers = async () => {
        try {
            const data = await getUsuarios();
            // Manejar nueva estructura con paginación
            const usersArray = data.usuarios || data;
            setUsers(Array.isArray(usersArray) ? usersArray : []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            setUsers([]);
        }
    };

    // Filtrar usuarios por nombre o correo
    const filteredUsers = users.filter(user =>
        user && user.nombre && (
            (user.nombre + ' ' + (user.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.correo && user.correo.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const clearMessages = () => {
        setError('');
        setSuccess('');
        setShowSuccessModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const userData = {
                nombre: form.nombre,
                correo: form.correo,
                telefono: form.telefono,
                rol: form.rol,
                apellido: form.apellido,
                direccion: form.direccion,
                genero: form.genero,
                tipoIdentificacion: form.tipoIdentificacion,
                numeroIdentificacion: form.numeroIdentificacion
            };

            // Solo incluir contraseña si se está creando usuario o si se especificó una nueva
            if (!editingUser || (editingUser && form.contrasena.trim())) {
                userData.contrasena = form.contrasena;
            }

            if (editingUser) {
                await updateUsuario(editingUser._id, userData);
                setSuccess('Usuario actualizado exitosamente!');
                setShowSuccessModal(true);
            } else {
                await createUsuario(userData);
                setSuccess('Usuario registrado exitosamente!');
                setShowSuccessModal(true);
            }

            await loadUsers();

            // Limpiar formulario
            setForm({
                nombre: '',
                correo: '',
                telefono: '',
                contrasena: '',
                rol: 'user',
                apellido: '',
                direccion: '',
                genero: '',
                tipoIdentificacion: '',
                numeroIdentificacion: ''
            });
            setEditingUser(null);
            setShowForm(false);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id) => {
        try {
            await deleteUsuario(id);
            await loadUsers();
        } catch (error) {
            console.error('Error eliminando usuario:', error);
            alert('Error al eliminar el usuario');
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete._id);
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const handleDetailsClick = (user) => {
        setUserDetails(user);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setUserDetails(null);
    };

    // Si no es admin, mostrar mensaje de acceso denegado
    if (!isAdmin()) {
        return (
            <div className="page">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: '3rem' }}>
                        <h1 className="page-title">🚫 Acceso Denegado</h1>
                        <p className="page-subtitle">No tienes permisos para acceder a esta página</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title">👥 Gestión de Usuarios</h1>
                    <p className="page-subtitle">Administra los usuarios del sistema</p>
                </div>

                <div className="crud-content">
                    {/* Mensajes de error y éxito */}
                    {error && (
                        <div className="alert-overlay" onClick={() => setError('')} style={{ zIndex: 9999 }}>
                            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="alert-icon">⚠️</div>
                                <div className="alert-title">Error</div>
                                <div className="alert-message">{error}</div>
                                <div className="alert-actions">
                                    <button className="btn btn-primary" onClick={() => setError('')}>Aceptar</button>
                                </div>
                            </div>
                        </div>
                    )}
                    {showSuccessModal && (
                        <div className="alert-overlay" onClick={() => setShowSuccessModal(false)} style={{ zIndex: 9999 }}>
                            <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
                                <div className="alert-icon">✅</div>
                                <div className="alert-title">¡Éxito!</div>
                                <div className="alert-message">{success}</div>
                                <div className="alert-actions">
                                    <button className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>Aceptar</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navegación por pestañas */}
                    <div className="tab-navigation tab-navigation-inline">
                        <button
                            className={`tab-button ${showForm ? 'active' : ''} tab-button-inline-margin`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(true);
                                if (!editingUser) {
                                    setForm({
                                        nombre: '',
                                        correo: '',
                                        telefono: '',
                                        contrasena: '',
                                        rol: 'user',
                                        apellido: '',
                                        direccion: '',
                                        genero: '',
                                        tipoIdentificacion: '',
                                        numeroIdentificacion: ''
                                    });
                                }
                            }}
                        >
                            ➕ Registrar Usuario
                        </button>
                        <button
                            className={`tab-button ${!showForm && !showReports ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                                setShowReports(false);
                                if (editingUser) {
                                    setEditingUser(null);
                                    setForm({
                                        nombre: '',
                                        correo: '',
                                        telefono: '',
                                        contrasena: '',
                                        rol: 'user',
                                        apellido: '',
                                        direccion: '',
                                        genero: '',
                                        tipoIdentificacion: '',
                                        numeroIdentificacion: ''
                                    });
                                }
                            }}
                        >
                            📋 Lista de Usuarios ({filteredUsers.length})
                        </button>
                        <button
                            className={`tab-button ${showReports ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                                setShowReports(true);
                                if (editingUser) {
                                    setEditingUser(null);
                                    setForm({
                                        nombre: '',
                                        correo: '',
                                        telefono: '',
                                        contrasena: '',
                                        rol: 'user',
                                        apellido: '',
                                        direccion: '',
                                        genero: '',
                                        tipoIdentificacion: '',
                                        numeroIdentificacion: ''
                                    });
                                }
                            }}
                        >
                            📊 Reportes
                        </button>
                    </div>

                    {showForm ? (
                        /* Formulario de registro */
                        <div className="form-section crud-fade-in">
                            <div className="form-section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">{editingUser ? '✏️' : '👤'}</span>
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h2>
                                <p className="section-description">
                                    {editingUser
                                        ? 'Modifica la información del usuario seleccionado'
                                        : 'Completa la información del usuario para agregarlo al sistema'
                                    }
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Nombre Completo
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={form.nombre}
                                            onChange={handleInputChange}
                                            placeholder="Nombre del usuario"
                                            required
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Correo Electrónico
                                        </label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={form.correo}
                                            onChange={handleInputChange}
                                            placeholder="correo@ejemplo.com"
                                            required
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={form.telefono}
                                            onChange={handleInputChange}
                                            placeholder="1234567890"
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Rol
                                        </label>
                                        <select
                                            name="rol"
                                            value={form.rol}
                                            onChange={handleInputChange}
                                            required
                                            className="field-input"
                                        >
                                            <option value="user">Usuario</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                </div>

                                {!editingUser ? (
                                    <div className="field-group">
                                        <div className="field-item">
                                            <label className="field-label field-required">
                                                Contraseña
                                            </label>
                                            <input
                                                type="password"
                                                name="contrasena"
                                                value={form.contrasena}
                                                onChange={handleInputChange}
                                                placeholder="Contraseña segura"
                                                required={!editingUser}
                                                className="field-input"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="field-group">
                                        <div className="field-item">
                                            <label className="field-label">
                                                Nueva Contraseña (opcional)
                                            </label>
                                            <input
                                                type="password"
                                                name="contrasena"
                                                value={form.contrasena}
                                                onChange={handleInputChange}
                                                placeholder="Dejar vacío para mantener contraseña actual"
                                                className="field-input"
                                            />
                                            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                Solo ingresa una contraseña si deseas cambiarla
                                            </small>
                                        </div>
                                    </div>
                                )}

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="apellido"
                                            value={form.apellido}
                                            onChange={handleInputChange}
                                            placeholder="Apellido del usuario"
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Dirección
                                        </label>
                                        <input
                                            type="text"
                                            name="direccion"
                                            value={form.direccion}
                                            onChange={handleInputChange}
                                            placeholder="Dirección completa"
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            Género
                                        </label>
                                        <select
                                            name="genero"
                                            value={form.genero}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        >
                                            <option value="">Seleccionar género</option>
                                            <option value="masculino">Masculino</option>
                                            <option value="femenino">Femenino</option>
                                            <option value="otro">Otro</option>
                                            <option value="prefiero_no_decir">Prefiero no decir</option>
                                        </select>
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Tipo de Identificación
                                        </label>
                                        <select
                                            name="tipoIdentificacion"
                                            value={form.tipoIdentificacion}
                                            onChange={handleInputChange}
                                            className="field-input"
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
                                            value={form.numeroIdentificacion}
                                            onChange={handleInputChange}
                                            placeholder="Número de identificación"
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <span>{editingUser ? '✏️' : '👤'}</span>
                                        {loading ? 'Guardando...' : editingUser ? 'Actualizar Usuario' : 'Registrar Usuario'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            clearMessages();
                                            if (editingUser) {
                                                // Si estamos editando, volver a cargar los datos del usuario
                                                setForm({
                                                    nombre: editingUser.nombre,
                                                    correo: editingUser.correo,
                                                    telefono: editingUser.telefono || '',
                                                    contrasena: '',
                                                    rol: editingUser.rol,
                                                    apellido: editingUser.apellido || '',
                                                    direccion: editingUser.direccion || '',
                                                    genero: editingUser.genero || '',
                                                    tipoIdentificacion: editingUser.tipoIdentificacion || '',
                                                    numeroIdentificacion: editingUser.numeroIdentificacion || ''
                                                });
                                            } else {
                                                // Si estamos creando, limpiar todo
                                                setForm({
                                                    nombre: '',
                                                    correo: '',
                                                    telefono: '',
                                                    contrasena: '',
                                                    rol: 'user',
                                                    apellido: '',
                                                    direccion: '',
                                                    genero: '',
                                                    tipoIdentificacion: '',
                                                    numeroIdentificacion: ''
                                                });
                                                setEditingUser(null);
                                            }
                                        }}
                                    >
                                        <span>🔄</span>
                                        {editingUser ? 'Restaurar' : 'Limpiar'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Lista de usuarios */
                        <div className="data-table-container crud-fade-in" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <div className="data-table-header books-header">
                                <span>👥</span>
                                Usuarios Registrados
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar usuario por nombre o correo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '400px' }}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {filteredUsers.length} de {users.length} usuarios
                                </span>
                            </div>

                            {filteredUsers.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">{searchTerm ? '🔍' : '👤'}</div>
                                    <h3 className="empty-title">
                                        {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                                    </h3>
                                    <p className="empty-description">
                                        {searchTerm
                                            ? `No hay usuarios que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
                                            : 'Registra tu primer usuario usando el formulario'
                                        }
                                    </p>
                                    {searchTerm && (
                                        <button
                                            className="btn btn-secondary btn-margin-top"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            <span>🔄</span>
                                            Limpiar Búsqueda
                                        </button>
                                    )}
                                    {!searchTerm && (
                                        <button
                                            className="btn btn-primary btn-margin-top"
                                            onClick={() => setShowForm(true)}
                                        >
                                            <span>➕</span>
                                            Registrar Primer Usuario
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-column-name">Nombre</th>
                                            <th className="table-column-email">Correo</th>
                                            <th className="table-column-role">Rol</th>
                                            <th className="table-column-phone">Teléfono</th>
                                            <th className="table-column-date">Fecha Registro</th>
                                            <th className="table-column-actions">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id}>
                                                <td>
                                                    <div className="table-text-primary">
                                                        {user.nombre} {user.apellido || ''}
                                                    </div>
                                                </td>
                                                <td>{user.correo}</td>
                                                <td>
                                                    <span className={`status-badge ${user.rol === 'admin' ? 'status-activo' : 'status-devuelto'}`}>
                                                        {user.rol === 'admin' ? '👑 Admin' : '👤 Usuario'}
                                                    </span>
                                                </td>
                                                <td>{user.telefono || 'No especificado'}</td>
                                                <td>
                                                    {user.createdAt ?
                                                        new Date(user.createdAt).toLocaleDateString('es-ES') :
                                                        'No disponible'
                                                    }
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleDetailsClick(user)}
                                                            title="Ver Detalles"
                                                        >
                                                            <span>👁️</span>
                                                            Ver Detalles
                                                        </button>
                                                        <button
                                                            className="btn btn-edit btn-sm"
                                                            onClick={() => {
                                                                setForm({
                                                                    nombre: user.nombre,
                                                                    correo: user.correo,
                                                                    telefono: user.telefono || '',
                                                                    contrasena: '',
                                                                    rol: user.rol,
                                                                    apellido: user.apellido || '',
                                                                    direccion: user.direccion || '',
                                                                    genero: user.genero || '',
                                                                    tipoIdentificacion: user.tipoIdentificacion || '',
                                                                    numeroIdentificacion: user.numeroIdentificacion || ''
                                                                });
                                                                setEditingUser(user);
                                                                setShowForm(true);
                                                            }}
                                                            title="Editar usuario"
                                                        >
                                                            <span>✏️</span>
                                                            Editar
                                                        </button>
                                                        <button
                                                            className="btn btn-delete btn-sm"
                                                            onClick={() => handleDeleteClick(user)}
                                                            title="Eliminar usuario"
                                                        >
                                                            <span>🗑️</span>
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Sección de Reportes */}
                    {showReports && (
                        <div className="reports-content crud-fade-in">
                            <div className="reports-header">
                                <h2 className="reports-title">
                                    <span className="section-icon">📊</span>
                                    Reportes de Usuarios
                                </h2>
                                <p className="reports-subtitle">
                                    Estadísticas y análisis del sistema de usuarios
                                </p>
                                <div className="reports-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('http://localhost:5001/api/reportes/usuarios/pdf');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = 'usuarios.pdf';
                                                link.click();
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error('Error descargando PDF:', error);
                                                alert('Error al descargar el PDF');
                                            }
                                        }}
                                        title="Descargar reporte en PDF"
                                    >
                                        <span>📄</span> Descargar PDF
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('http://localhost:5001/api/reportes/usuarios/excel');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = 'usuarios.xlsx';
                                                link.click();
                                                window.URL.revokeObjectURL(url);
                                            } catch (error) {
                                                console.error('Error descargando Excel:', error);
                                                alert('Error al descargar el Excel');
                                            }
                                        }}
                                        title="Descargar reporte en Excel"
                                    >
                                        <span>📊</span> Descargar Excel
                                    </button>
                                </div>
                            </div>

                            {/* Estadísticas principales */}
                            <div className="stats-overview">
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: 'white' }}>
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-content">
                                        <h3>{users.length}</h3>
                                        <p>Total Usuarios</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                                    <div className="stat-icon">👤</div>
                                    <div className="stat-content">
                                        <h3>{users.filter(u => u.rol === 'user').length}</h3>
                                        <p>Usuarios Normales</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a0f08' }}>
                                    <div className="stat-icon">👑</div>
                                    <div className="stat-content">
                                        <h3>{users.filter(u => u.rol === 'admin').length}</h3>
                                        <p>Administradores</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                                    <div className="stat-icon">📅</div>
                                    <div className="stat-content">
                                        <h3>{users.filter(u => {
                                            const createdDate = new Date(u.createdAt);
                                            const monthAgo = new Date();
                                            monthAgo.setMonth(monthAgo.getMonth() - 1);
                                            return createdDate > monthAgo;
                                        }).length}</h3>
                                        <p>Nuevos (último mes)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico de distribución por roles */}
                            <div className="chart-container">
                                <h3 className="chart-title">Distribución por Roles</h3>
                                <div className="pie-chart">
                                    <div className="pie-svg">
                                        <svg viewBox="0 0 200 200" className="pie-svg">
                                            {(() => {
                                                const total = users.length;
                                                const adminCount = users.filter(u => u.rol === 'admin').length;
                                                const userCount = users.filter(u => u.rol === 'user').length;
                                                const adminAngle = (adminCount / total) * 360;
                                                const userAngle = (userCount / total) * 360;

                                                return (
                                                    <>
                                                        {adminCount > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="#FFD700"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${adminAngle} ${360 - adminAngle}`}
                                                                transform="rotate(-90 100 100)"
                                                            />
                                                        )}
                                                        {userCount > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="#228B22"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${userAngle} ${360 - userAngle}`}
                                                                transform={`rotate(${adminAngle - 90} 100 100)`}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            })()}
                                            <circle cx="100" cy="100" r="30" fill="white" />
                                        </svg>
                                        <div className="pie-center">
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                {users.length}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                Total
                                            </div>
                                        </div>
                                    </div>
                                    <div className="pie-legend">
                                        <div className="pie-legend-item">
                                            <div className="pie-legend-color" style={{ backgroundColor: '#FFD700' }}></div>
                                            <div className="pie-legend-text">
                                                <strong>Administradores</strong><br />
                                                {users.filter(u => u.rol === 'admin').length} ({((users.filter(u => u.rol === 'admin').length / users.length) * 100).toFixed(1)}%)
                                            </div>
                                        </div>
                                        <div className="pie-legend-item">
                                            <div className="pie-legend-color" style={{ backgroundColor: '#228B22' }}></div>
                                            <div className="pie-legend-text">
                                                <strong>Usuarios</strong><br />
                                                {users.filter(u => u.rol === 'user').length} ({((users.filter(u => u.rol === 'user').length / users.length) * 100).toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Usuarios más recientes */}
                            <div className="chart-container">
                                <h3 className="chart-title">Usuarios Más Recientes</h3>
                                <div className="top-list">
                                    {users
                                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                                        .slice(0, 5)
                                        .map((user, index) => (
                                            <div key={user._id} className="top-item">
                                                <div className="top-rank">{index + 1}</div>
                                                <div className="top-info">
                                                    <div className="top-title">{user.nombre} {user.apellido || ''}</div>
                                                    <div className="top-subtitle">{user.correo}</div>
                                                </div>
                                                <div className="top-count">
                                                    {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {showDetailsModal && userDetails && (
                <div className="confirmation-modal-overlay" onClick={closeDetailsModal}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">👤</div>
                        <h3 className="confirmation-modal-title">Detalles del Usuario</h3>

                        <div className="confirmation-modal-item-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: userDetails.rol === 'admin' ? 'var(--gradient-primary)' : 'var(--gradient-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '3rem',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                }}>
                                    {userDetails.rol === 'admin' ? '👑' : '👤'}
                                </div>
                            </div>
                            <div className="confirmation-modal-item-name" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {userDetails.nombre} {userDetails.apellido || ''}
                            </div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                                {userDetails.rol === 'admin' ? '👑 Administrador' : '👤 Usuario'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                                <div>
                                    <strong>Correo:</strong> {userDetails.correo}
                                </div>
                                <div>
                                    <strong>Teléfono:</strong> {userDetails.telefono || 'No especificado'}
                                </div>
                                <div>
                                    <strong>Dirección:</strong> {userDetails.direccion || 'No especificada'}
                                </div>
                                <div>
                                    <strong>Género:</strong> {userDetails.genero || 'No especificado'}
                                </div>
                                <div>
                                    <strong>Identificación:</strong> {userDetails.tipoIdentificacion && userDetails.numeroIdentificacion ?
                                        `${userDetails.tipoIdentificacion.toUpperCase()}: ${userDetails.numeroIdentificacion}` :
                                        'No especificada'}
                                </div>
                                <div>
                                    <strong>Fecha de Registro:</strong> {userDetails.createdAt ?
                                        new Date(userDetails.createdAt).toLocaleDateString('es-ES') :
                                        'No disponible'}
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-modal-actions">
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={closeDetailsModal}
                            >
                                <span>✅</span>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación */}
            {showDeleteModal && userToDelete && (
                <div className="confirmation-modal-overlay" onClick={cancelDelete}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">⚠️</div>
                        <h3 className="confirmation-modal-title">¿Eliminar Usuario?</h3>
                        <p className="confirmation-modal-message">
                            Esta acción no se puede deshacer. El usuario será eliminado permanentemente.
                        </p>

                        <div className="confirmation-modal-item-info">
                             <div className="confirmation-modal-item-name">
                                 {userToDelete.nombre} {userToDelete.apellido || ''}
                             </div>
                             <div className="confirmation-modal-item-details">
                                 {userToDelete.correo}
                             </div>
                         </div>

                        <div className="confirmation-modal-actions">
                            <button
                                className="btn btn-cancel btn-sm"
                                onClick={cancelDelete}
                            >
                                <span>❌</span>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-confirm btn-sm"
                                onClick={confirmDelete}
                            >
                                <span>🗑️</span>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;