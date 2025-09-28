
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrestamos, createPrestamo, updatePrestamo, deletePrestamo, getUsuarios, getLibros } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Borrow = () => {
    const { isAdmin, user } = useAuth();
    const [form, setForm] = useState({
        userId: '',
        bookId: '',
        borrowDate: '',
        returnDate: ''
    });
    const [borrows, setBorrows] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [libros, setLibros] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [borrowToDelete, setBorrowToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReports, setShowReports] = useState(false);
    const [editingBorrow, setEditingBorrow] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [borrowDetails, setBorrowDetails] = useState(null);

    // Cargar préstamos, usuarios y libros al montar el componente
    useEffect(() => {
        loadPrestamos();
        loadUsuarios();
        loadLibros();
    }, []);

    const loadPrestamos = async () => {
        try {
            const data = await getPrestamos();
            // Manejar nueva estructura con paginación
            const borrowsArray = data.prestamos || data;
            setBorrows(Array.isArray(borrowsArray) ? borrowsArray : []);
        } catch (error) {
            console.error('Error cargando préstamos:', error);
            setBorrows([]);
        }
    };

    const loadUsuarios = async () => {
        try {
            const data = await getUsuarios();
            // Manejar nueva estructura con paginación
            const usuariosArray = data.usuarios || data;
            setUsuarios(Array.isArray(usuariosArray) ? usuariosArray : []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            setUsuarios([]);
        }
    };

    const loadLibros = async () => {
        try {
            const data = await getLibros();
            // Manejar nueva estructura con paginación
            const librosArray = data.libros || data;
            setLibros(Array.isArray(librosArray) ? librosArray : []);
        } catch (error) {
            console.error('Error cargando libros:', error);
            setLibros([]);
        }
    };

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
            const prestamoData = {
                usuario: form.userId,
                libro: form.bookId,
                fechaPrestamo: form.borrowDate ? new Date(form.borrowDate) : new Date(),
                fechaDevolucion: form.returnDate ? new Date(form.returnDate) : null
            };

            if (editingBorrow) {
                // Actualizar préstamo existente
                await updatePrestamo(editingBorrow._id, prestamoData);
                setSuccess('Préstamo actualizado exitosamente!');
            } else {
                // Crear nuevo préstamo
                await createPrestamo(prestamoData);
                setSuccess('Préstamo registrado exitosamente!');
            }

            setShowSuccessModal(true);

            await loadPrestamos();
            await loadLibros(); // Recargar libros para actualizar estados

            // Limpiar formulario y resetear edición
            setForm({
                userId: '',
                bookId: '',
                borrowDate: '',
                returnDate: ''
            });
            setEditingBorrow(null);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || `Error al ${editingBorrow ? 'actualizar' : 'registrar'} el préstamo`);
        } finally {
            setLoading(false);
        }
    };

    const deleteBorrow = async (id) => {
        try {
            await deletePrestamo(id);
            await loadPrestamos();
            await loadLibros(); // Recargar libros para actualizar estados
        } catch (error) {
            console.error('Error eliminando préstamo:', error);
            alert('Error al eliminar el préstamo');
        }
    };


    const handleEditClick = (borrow) => {
        setForm({
            userId: borrow.usuario?._id || '',
            bookId: borrow.libro?._id || '',
            borrowDate: borrow.fechaPrestamo ? new Date(borrow.fechaPrestamo).toISOString().split('T')[0] : '',
            returnDate: borrow.fechaDevolucion ? new Date(borrow.fechaDevolucion).toISOString().split('T')[0] : ''
        });
        setEditingBorrow(borrow);
        setShowForm(true);
        clearMessages();
    };

    const handleDetailsClick = (borrow) => {
        setBorrowDetails(borrow);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setBorrowDetails(null);
    };

    const handleDeleteClick = (borrow) => {
        setBorrowToDelete(borrow);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (borrowToDelete) {
            deleteBorrow(borrowToDelete._id);
            setShowDeleteModal(false);
            setBorrowToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBorrowToDelete(null);
    };

    // Filtrar préstamos activos por usuario o libro
    const filteredBorrows = borrows.filter(borrow =>
        borrow && borrow.estado === 'activo' && (
            (borrow.usuario?.nombre + ' ' + (borrow.usuario?.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (borrow.libro?.titulo && borrow.libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            activo: { text: 'Activo', class: 'status-activo' },
            devuelto: { text: 'Devuelto', class: 'status-devuelto' },
            vencido: { text: 'Vencido', class: 'status-vencido' }
        };
        const config = statusConfig[status] || { text: 'Desconocido', class: 'status-activo' };
        return (
            <span className={`status-badge ${config.class}`}>
                {config.text}
            </span>
        );
    };

    return (
        <div className="page">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title">📖 {isAdmin() ? 'Gestión de Préstamos Activos' : 'Mis Préstamos Activos'}</h1>
                    <p className="page-subtitle">
                        {isAdmin() ? 'Registra y administra los préstamos activos de libros' : 'Revisa el estado de tus préstamos activos de libros'}
                    </p>
                </div>

                <div className="crud-content">
                    {/* Mensajes de error y éxito */}
                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}
                    {showSuccessModal && (
                        <div className="alert-overlay" onClick={() => setShowSuccessModal(false)}>
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
                        {isAdmin() && (
                            <button
                                className={`tab-button ${showForm ? 'active' : ''} tab-button-inline-margin`}
                                onClick={() => {
                                    clearMessages();
                                    setShowForm(true);
                                    if (!editingBorrow) {
                                        setForm({
                                            userId: '',
                                            bookId: '',
                                            borrowDate: '',
                                            returnDate: ''
                                        });
                                    }
                                }}
                            >
                                {editingBorrow ? '✏️ Editando Préstamo' : '➕ Registrar Préstamo'}
                            </button>
                        )}
                        <button
                            className={`tab-button ${!showForm && !showReports ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                                setShowReports(false);
                                if (editingBorrow) {
                                    setEditingBorrow(null);
                                    setForm({
                                        userId: '',
                                        bookId: '',
                                        borrowDate: '',
                                        returnDate: ''
                                    });
                                }
                            }}
                        >
                            📋 {isAdmin() ? `Préstamos Activos (${filteredBorrows.length})` : `Mis Préstamos Activos (${filteredBorrows.filter(b => b.usuario?._id === user?._id).length})`}
                        </button>
                        {isAdmin() && (
                            <button
                                className={`tab-button ${showReports ? 'active' : ''}`}
                                onClick={() => {
                                    clearMessages();
                                    setShowForm(false);
                                    setShowReports(!showReports);
                                }}
                            >
                                📊 Reportes
                            </button>
                        )}
                    </div>

                    {showForm && isAdmin() ? (
                        /* Formulario de registro */
                        <div className="form-section crud-fade-in">
                            <div className="form-section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">{editingBorrow ? '✏️' : '📝'}</span>
                                    {editingBorrow ? 'Editar Préstamo' : 'Nuevo Préstamo'}
                                </h2>
                                <p className="section-description">
                                    {editingBorrow
                                        ? 'Modifica la información del préstamo seleccionado'
                                        : 'Registra un nuevo préstamo de libro'
                                    }
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Usuario
                                        </label>
                                        <select
                                            name="userId"
                                            value={form.userId}
                                            onChange={handleInputChange}
                                            required
                                            className="field-input"
                                        >
                                            <option value="">Seleccionar usuario</option>
                                            {usuarios.filter(u => u.rol === 'user' && u._id && !u._id.startsWith('user_')).map(user => (
                                                <option key={user._id} value={user._id}>
                                                    {user.nombre} {user.apellido} - {user.correo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Libro
                                        </label>
                                        <select
                                            name="bookId"
                                            value={form.bookId}
                                            onChange={handleInputChange}
                                            required
                                            className="field-input"
                                        >
                                            <option value="">Seleccionar libro</option>
                                            {libros.map(libro => (
                                                <option key={libro._id} value={libro._id}>
                                                    {libro.titulo} - {libro.autor?.nombre || 'Sin autor'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Fecha de Préstamo
                                        </label>
                                        <input
                                            type="date"
                                            name="borrowDate"
                                            value={form.borrowDate}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Fecha de Devolución
                                        </label>
                                        <input
                                            type="date"
                                            name="returnDate"
                                            value={form.returnDate}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        />
                                    </div>
                                </div>


                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <span>{editingBorrow ? '✏️' : '📖'}</span>
                                        {loading ? 'Guardando...' : editingBorrow ? 'Actualizar Préstamo' : 'Registrar Préstamo'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            clearMessages();
                                            setForm({
                                                userId: '',
                                                bookId: '',
                                                borrowDate: '',
                                                returnDate: ''
                                            });
                                            setEditingBorrow(null);
                                        }}
                                    >
                                        <span>🔄</span>
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Lista de préstamos */
                        <div className="data-table-container crud-fade-in" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <div className="data-table-header books-header">
                                <span>📋</span>
                                Préstamos Activos
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar préstamo activo por usuario o libro..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '400px' }}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {filteredBorrows.length} de {borrows.length} préstamos
                                </span>
                            </div>

                            {(isAdmin() ? filteredBorrows : filteredBorrows.filter(b => {
                                const idMatch = b.usuario?._id === user?._id;
                                const emailMatch = b.usuario?.correo === user?.correo;
                                return idMatch || emailMatch;
                            })).length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">{searchTerm ? '🔍' : '📚'}</div>
                                    <h3 className="empty-title">
                                        {searchTerm
                                            ? 'No se encontraron préstamos activos'
                                            : isAdmin() ? 'No hay préstamos activos' : 'No tienes préstamos activos'
                                        }
                                    </h3>
                                    <p className="empty-description">
                                        {searchTerm
                                            ? `No hay préstamos activos que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
                                            : isAdmin() ? 'Todos los préstamos han sido devueltos o no hay préstamos registrados' : 'Cuando tengas un préstamo activo de libro, aparecerá aquí'
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
                                    {!searchTerm && isAdmin() && (
                                        <button
                                            className="btn btn-primary btn-margin-top"
                                            onClick={() => setShowForm(true)}
                                        >
                                            <span>➕</span>
                                            Registrar Nuevo Préstamo
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-column-user">Usuario</th>
                                            <th className="table-column-book">Libro</th>
                                            <th className="table-column-date">Fecha Préstamo</th>
                                            <th className="table-column-date">Fecha Devolución</th>
                                            <th className="table-column-status">Estado</th>
                                            <th className="table-column-actions">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(isAdmin() ? filteredBorrows : filteredBorrows.filter(b => {
                                            const idMatch = b.usuario?._id === user?._id;
                                            const emailMatch = b.usuario?.correo === user?.correo;
                                            return idMatch || emailMatch;
                                        })).map((borrow) => (
                                            <tr key={borrow._id} className="borrow-hover">
                                                <td>
                                                    <div className="table-text-primary">
                                                        {borrow.usuario?.nombre} {borrow.usuario?.apellido}
                                                    </div>
                                                    <div className="table-text-secondary">
                                                        {borrow.usuario?.correo}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-text-primary">
                                                        {borrow.libro?.titulo}
                                                    </div>
                                                    <div className="table-text-secondary">
                                                        ISBN: {borrow.libro?.isbn}
                                                    </div>
                                                </td>
                                                <td>
                                                    {borrow.fechaPrestamo ?
                                                        new Date(borrow.fechaPrestamo).toLocaleDateString('es-ES') :
                                                        'No especificada'
                                                    }
                                                </td>
                                                <td>
                                                    {borrow.fechaDevolucion ?
                                                        new Date(borrow.fechaDevolucion).toLocaleDateString('es-ES') :
                                                        'No especificada'
                                                    }
                                                </td>
                                                <td>
                                                    {getStatusBadge(borrow.estado)}
                                                </td>
                                                <td>
                                                    {isAdmin() ? (
                                                        <div className="table-actions">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDetailsClick(borrow)}
                                                                title="Ver Detalles"
                                                            >
                                                                <span>👁️</span>
                                                                Ver Detalles
                                                            </button>
                                                            <button
                                                                className="btn btn-edit btn-sm"
                                                                onClick={() => handleEditClick(borrow)}
                                                                title="Editar"
                                                            >
                                                                <span>✏️</span>
                                                                Editar
                                                            </button>
                                                            <button
                                                                className="btn btn-delete btn-sm"
                                                                onClick={() => handleDeleteClick(borrow)}
                                                                title="Eliminar préstamo"
                                                            >
                                                                <span>🗑️</span>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="table-actions">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDetailsClick(borrow)}
                                                                title="Ver Detalles"
                                                            >
                                                                <span>👁️</span>
                                                                Ver Detalles
                                                            </button>
                                                            <span className={`status-badge ${borrow.estado === 'activo' ? 'status-activo' : borrow.estado === 'devuelto' ? 'status-devuelto' : 'status-vencido'}`}>
                                                                {borrow.estado === 'activo' ? 'Activo' : borrow.estado === 'devuelto' ? 'Devuelto' : 'Vencido'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Sección de Reportes */}
            {showReports && isAdmin() && (
                <div className="reports-content crud-fade-in">
                    <div className="reports-header">
                        <h2 className="reports-title">
                            <span className="section-icon">📊</span>
                            Reportes de Préstamos Activos
                        </h2>
                        <p className="reports-subtitle">
                            Estadísticas y análisis de los préstamos actualmente activos
                        </p>
                        <div className="reports-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    try {
                                        const response = await fetch('http://localhost:5001/api/reportes/prestamos/pdf');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'prestamos.pdf';
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
                                        const response = await fetch('http://localhost:5001/api/reportes/prestamos/excel');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'prestamos.xlsx';
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
                            <div className="stat-icon">📋</div>
                            <div className="stat-content">
                                <h3>{borrows.filter(b => b.estado === 'activo').length}</h3>
                                <p>Préstamos Activos</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                            <div className="stat-icon">📚</div>
                            <div className="stat-content">
                                <h3>{new Set(borrows.filter(b => b.estado === 'activo').map(b => b.libro?._id).filter(Boolean)).size}</h3>
                                <p>Libros Prestados</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a0f08' }}>
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3>{new Set(borrows.filter(b => b.estado === 'activo').map(b => b.usuario?._id).filter(Boolean)).size}</h3>
                                <p>Usuarios Activos</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                            <div className="stat-icon">📅</div>
                            <div className="stat-content">
                                <h3>{(() => {
                                    const today = new Date();
                                    const thisMonth = borrows.filter(b => b.estado === 'activo' && b.fechaPrestamo && new Date(b.fechaPrestamo).getMonth() === today.getMonth() && new Date(b.fechaPrestamo).getFullYear() === today.getFullYear()).length;
                                    return thisMonth;
                                })()}</h3>
                                <p>Este Mes</p>
                            </div>
                        </div>
                    </div>

                    {/* Libros más prestados actualmente */}
                    <div className="chart-container">
                        <h3 className="chart-title">Libros Más Prestados Actualmente</h3>
                        <div className="top-list">
                            {(() => {
                                const bookStats = {};
                                borrows.filter(b => b.estado === 'activo').forEach(borrow => {
                                    const bookId = borrow.libro?._id;
                                    const bookTitle = borrow.libro?.titulo || 'Libro desconocido';
                                    if (bookId) {
                                        if (!bookStats[bookId]) {
                                            bookStats[bookId] = { title: bookTitle, count: 0 };
                                        }
                                        bookStats[bookId].count++;
                                    }
                                });

                                return Object.entries(bookStats)
                                    .sort(([,a], [,b]) => b.count - a.count)
                                    .slice(0, 5)
                                    .map(([bookId, data], index) => (
                                        <div key={bookId} className="top-item">
                                            <div className="top-rank">{index + 1}</div>
                                            <div className="top-info">
                                                <div className="top-title">{data.title}</div>
                                                <div className="top-subtitle">Libro prestado</div>
                                            </div>
                                            <div className="top-count">{data.count} copias activas</div>
                                        </div>
                                    ));
                            })()}
                        </div>
                    </div>

                    {/* Usuarios más activos */}
                    <div className="chart-container">
                        <h3 className="chart-title">Usuarios Más Activos</h3>
                        <div className="top-list">
                            {(() => {
                                const userStats = {};
                                borrows.forEach(borrow => {
                                    const userId = borrow.usuario?._id;
                                    const userName = borrow.usuario?.nombre + ' ' + (borrow.usuario?.apellido || '');
                                    if (userId) {
                                        if (!userStats[userId]) {
                                            userStats[userId] = { name: userName, count: 0 };
                                        }
                                        userStats[userId].count++;
                                    }
                                });

                                return Object.entries(userStats)
                                    .sort(([,a], [,b]) => b.count - a.count)
                                    .slice(0, 5)
                                    .map(([userId, data], index) => (
                                        <div key={userId} className="top-item">
                                            <div className="top-rank">{index + 1}</div>
                                            <div className="top-info">
                                                <div className="top-title">{data.name}</div>
                                                <div className="top-subtitle">Usuario activo</div>
                                            </div>
                                            <div className="top-count">{data.count} préstamos</div>
                                        </div>
                                    ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalles */}
            {showDetailsModal && borrowDetails && (
                <div className="confirmation-modal-overlay" onClick={closeDetailsModal}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">📖</div>
                        <h3 className="confirmation-modal-title">Detalles del Préstamo</h3>

                        <div className="confirmation-modal-item-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2rem',
                                    color: 'var(--text-white)',
                                    margin: '0 auto',
                                    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                }}>
                                    📚
                                </div>
                            </div>
                            <div className="confirmation-modal-item-name" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {borrowDetails.libro?.titulo}
                            </div>
                            <div className="confirmation-modal-item-details">
                                por {borrowDetails.libro?.autor?.nombre || 'Autor desconocido'}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                                <div>
                                    <strong>Usuario:</strong> {borrowDetails.usuario?.nombre} {borrowDetails.usuario?.apellido}
                                </div>
                                <div>
                                    <strong>Correo:</strong> {borrowDetails.usuario?.correo}
                                </div>
                                <div>
                                    <strong>Libro:</strong> {borrowDetails.libro?.titulo}
                                </div>
                                <div>
                                    <strong>Autor:</strong> {borrowDetails.libro?.autor?.nombre || 'No especificado'}
                                </div>
                                <div>
                                    <strong>ISBN:</strong> {borrowDetails.libro?.isbn || 'No especificado'}
                                </div>
                                <div>
                                    <strong>Fecha de Préstamo:</strong> {borrowDetails.fechaPrestamo ?
                                        new Date(borrowDetails.fechaPrestamo).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No especificada'}
                                </div>
                                <div>
                                    <strong>Fecha de Devolución:</strong> {borrowDetails.fechaDevolucion ?
                                        new Date(borrowDetails.fechaDevolucion).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) : 'No especificada'}
                                </div>
                                <div>
                                    <strong>Estado:</strong>
                                    <span className={`status-badge ${borrowDetails.estado === 'activo' ? 'status-activo' : borrowDetails.estado === 'devuelto' ? 'status-devuelto' : 'status-vencido'}`} style={{ marginLeft: '0.5rem' }}>
                                        {borrowDetails.estado === 'activo' ? 'Activo' : borrowDetails.estado === 'devuelto' ? 'Devuelto' : 'Vencido'}
                                    </span>
                                </div>
                                <div>
                                    <strong>Fecha de Registro:</strong> {borrowDetails.createdAt ?
                                        new Date(borrowDetails.createdAt).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'No disponible'}
                                </div>
                            </div>
                        </div>

                        <div className="confirmation-modal-actions">
                            {isAdmin() && (
                                <>
                                    <button
                                        className="btn btn-edit btn-sm"
                                        onClick={() => {
                                            closeDetailsModal();
                                            handleEditClick(borrowDetails);
                                        }}
                                    >
                                        <span>✏️</span>
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-delete btn-sm"
                                        onClick={() => {
                                            closeDetailsModal();
                                            handleDeleteClick(borrowDetails);
                                        }}
                                    >
                                        <span>🗑️</span>
                                        Eliminar
                                    </button>
                                </>
                            )}
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
            {showDeleteModal && borrowToDelete && (
                <div className="confirmation-modal-overlay" onClick={cancelDelete}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">⚠️</div>
                        <h3 className="confirmation-modal-title">¿Eliminar Préstamo?</h3>
                        <p className="confirmation-modal-message">
                            Esta acción no se puede deshacer. El préstamo será eliminado permanentemente.
                        </p>

                        <div className="confirmation-modal-item-info">
                            <div className="confirmation-modal-item-name">
                                Préstamo de "{borrowToDelete.libro?.titulo}"
                            </div>
                            <div className="confirmation-modal-item-details">
                                Usuario: {borrowToDelete.usuario?.nombre} {borrowToDelete.usuario?.apellido}
                                {borrowToDelete.fechaPrestamo && ` • Préstamo: ${new Date(borrowToDelete.fechaPrestamo).toLocaleDateString('es-ES')}`}
                                {borrowToDelete.fechaDevolucion && ` • Devolución: ${new Date(borrowToDelete.fechaDevolucion).toLocaleDateString('es-ES')}`}
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

export default Borrow;