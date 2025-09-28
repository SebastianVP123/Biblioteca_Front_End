import React, { useState, useEffect } from 'react';
import { getPrestamos, updatePrestamo, getDevoluciones, createDevolucion, updateDevolucion, deleteDevolucion } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Returns = () => {
    const { isAdmin, user } = useAuth();
    const [form, setForm] = useState({
        prestamoId: '',
        fechaDevolucion: '',
        estado: 'devuelto',
        observaciones: '',
        condicionLibro: 'bueno'
    });
    const [returns, setReturns] = useState([]);
    const [prestamosActivos, setPrestamosActivos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [returnToDelete, setReturnToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [returnDetails, setReturnDetails] = useState(null);
    const [editingReturn, setEditingReturn] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReports, setShowReports] = useState(false);

    // Cargar préstamos activos y devoluciones al montar el componente
    useEffect(() => {
        loadPrestamosActivos();
        loadReturns();
    }, []);

    const loadPrestamosActivos = async () => {
        try {
            const data = await getPrestamos();
            // Filtrar solo préstamos activos
            const activos = Array.isArray(data.prestamos || data)
                ? (data.prestamos || data).filter(p => p.estado === 'activo')
                : [];
            setPrestamosActivos(activos);
        } catch (error) {
            console.error('Error cargando préstamos activos:', error);
            setPrestamosActivos([]);
        }
    };

    const loadReturns = async () => {
        try {
            const data = await getDevoluciones();
            // Las devoluciones vienen directamente de la colección devoluciones
            const devoluciones = Array.isArray(data.devoluciones || data)
                ? (data.devoluciones || data)
                : [];
            setReturns(devoluciones);
        } catch (error) {
            console.error('Error cargando devoluciones:', error);
            setReturns([]);
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
            // Obtener datos del préstamo seleccionado
            const prestamoSeleccionado = prestamosActivos.find(p => p._id === form.prestamoId);
            if (!prestamoSeleccionado) {
                throw new Error('Préstamo no encontrado');
            }

            const devolucionData = {
                prestamo: form.prestamoId,
                usuario: prestamoSeleccionado.usuario._id,
                libro: prestamoSeleccionado.libro._id,
                fechaDevolucionReal: form.fechaDevolucion ? new Date(form.fechaDevolucion) : new Date(),
                fechaDevolucionEsperada: prestamoSeleccionado.fechaDevolucion,
                estado: form.estado === 'devuelto' ? 'a_tiempo' : 'retrasado',
                condicionLibro: form.condicionLibro,
                observaciones: form.observaciones || ''
            };

            if (editingReturn) {
                await updateDevolucion(editingReturn._id, devolucionData);
                setSuccess('Devolución actualizada exitosamente!');
            } else {
                await createDevolucion(devolucionData);
                // Actualizar el estado del préstamo a devuelto/vencido
                await updatePrestamo(form.prestamoId, {
                    estado: form.estado,
                    fechaDevolucion: form.fechaDevolucion ? new Date(form.fechaDevolucion) : new Date()
                });
                setSuccess('Devolución registrada exitosamente!');
            }

            setShowSuccessModal(true);

            await loadPrestamosActivos();
            await loadReturns();

            // Limpiar formulario y resetear edición
            setForm({
                prestamoId: '',
                fechaDevolucion: '',
                estado: 'devuelto',
                observaciones: '',
                condicionLibro: 'bueno'
            });
            setEditingReturn(null);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || `Error al ${editingReturn ? 'actualizar' : 'registrar'} la devolución`);
        } finally {
            setLoading(false);
        }
    };

    const handleDetailsClick = (returnItem) => {
        setReturnDetails(returnItem);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setReturnDetails(null);
    };

    const handleEditClick = (returnItem) => {
        setForm({
            prestamoId: returnItem.prestamo._id || returnItem.prestamo,
            fechaDevolucion: returnItem.fechaDevolucionReal ? new Date(returnItem.fechaDevolucionReal).toISOString().split('T')[0] : '',
            estado: returnItem.estado === 'a_tiempo' ? 'devuelto' : returnItem.estado === 'retrasado' ? 'vencido' : returnItem.estado,
            condicionLibro: returnItem.condicionLibro || 'bueno',
            observaciones: returnItem.observaciones || ''
        });
        setEditingReturn(returnItem);
        setShowForm(true);
        clearMessages();
    };

    const handleDeleteClick = (returnItem) => {
        setReturnToDelete(returnItem);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (returnToDelete) {
            // Eliminar la devolución de la colección devoluciones
            deleteDevolucion(returnToDelete._id).then(() => {
                // Revertir el préstamo a activo
                updatePrestamo(returnToDelete.prestamo._id || returnToDelete.prestamo, {
                    estado: 'activo',
                    fechaDevolucion: null
                });
                setShowDeleteModal(false);
                setReturnToDelete(null);
                loadPrestamosActivos();
                loadReturns();
            }).catch((error) => {
                console.error('Error eliminando devolución:', error);
                alert('Error al eliminar la devolución');
            });
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setReturnToDelete(null);
    };

    // Filtrar devoluciones por usuario o libro
    const filteredReturns = returns.filter(returnItem =>
        returnItem && (
            (returnItem.usuario?.nombre + ' ' + (returnItem.usuario?.apellido || '')).toLowerCase().includes(searchTerm.toLowerCase()) ||
            (returnItem.libro?.titulo && returnItem.libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const getStatusBadge = (status) => {
        const statusConfig = {
            devuelto: { text: 'Devuelto', class: 'status-devuelto' },
            vencido: { text: 'Vencido', class: 'status-vencido' }
        };
        const config = statusConfig[status] || { text: 'Desconocido', class: 'status-devuelto' };
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
                    <h1 className="page-title">📚 {isAdmin() ? 'Gestión de Devoluciones' : 'Mis Devoluciones'}</h1>
                    <p className="page-subtitle">
                        {isAdmin() ? 'Registra y administra las devoluciones de libros' : 'Revisa el historial de tus devoluciones'}
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
                                    if (!editingReturn) {
                                        setForm({
                                            prestamoId: '',
                                            fechaDevolucion: '',
                                            estado: 'devuelto',
                                            observaciones: ''
                                        });
                                    }
                                }}
                            >
                                {editingReturn ? '✏️ Editando Devolución' : '➕ Registrar Devolución'}
                            </button>
                        )}
                        <button
                            className={`tab-button ${!showForm && !showReports || !isAdmin() && !showReports ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                                setShowReports(false);
                                if (editingReturn) {
                                    setEditingReturn(null);
                                    setForm({
                                        prestamoId: '',
                                        fechaDevolucion: '',
                                        estado: 'devuelto',
                                        observaciones: '',
                                        condicionLibro: 'bueno'
                                    });
                                }
                            }}
                        >
                            📋 {isAdmin() ? `Historial de Devoluciones (${filteredReturns.length})` : `Mis Devoluciones (${filteredReturns.filter(r => r.usuario?._id === user?._id).length})`}
                        </button>
                        {isAdmin() && (
                            <button
                                className={`tab-button ${showReports ? 'active' : ''}`}
                                onClick={() => {
                                    clearMessages();
                                    setShowForm(false);
                                    setShowReports(true);
                                }}
                            >
                                📊 Reportes
                            </button>
                        )}
                    </div>

                    {showForm && isAdmin() ? (
                        /* Formulario de registro de devolución */
                        <div className="form-section crud-fade-in">
                            <div className="form-section-header">
                                <h2 className="section-title">
                                    <span className="section-icon">{editingReturn ? '✏️' : '📚'}</span>
                                    {editingReturn ? 'Editar Devolución' : 'Registrar Devolución'}
                                </h2>
                                <p className="section-description">
                                    {editingReturn
                                        ? 'Modifica la información de la devolución seleccionada'
                                        : 'Registra la devolución de un libro prestado'
                                    }
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Préstamo Activo
                                        </label>
                                        <select
                                            name="prestamoId"
                                            value={form.prestamoId}
                                            onChange={handleInputChange}
                                            required
                                            className="field-input"
                                        >
                                            <option value="">Seleccionar préstamo</option>
                                            {/* Mostrar préstamo actual si estamos editando */}
                                            {editingReturn && !prestamosActivos.find(p => p._id === editingReturn._id) && (
                                                <option key={editingReturn._id} value={editingReturn._id}>
                                                    {editingReturn.libro?.titulo} - {editingReturn.usuario?.nombre} {editingReturn.usuario?.apellido} (Actual)
                                                </option>
                                            )}
                                            {prestamosActivos.map(prestamo => (
                                                <option key={prestamo._id} value={prestamo._id}>
                                                    {prestamo.libro?.titulo} - {prestamo.usuario?.nombre} {prestamo.usuario?.apellido}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Fecha de Devolución
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaDevolucion"
                                            value={form.fechaDevolucion}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Estado de Devolución
                                        </label>
                                        <select
                                            name="estado"
                                            value={form.estado}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        >
                                            <option value="devuelto">Devuelto</option>
                                            <option value="vencido">Vencido</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Condición del Libro
                                        </label>
                                        <select
                                            name="condicionLibro"
                                            value={form.condicionLibro}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        >
                                            <option value="bueno">Bueno</option>
                                            <option value="regular">Regular</option>
                                            <option value="dañado">Dañado</option>
                                            <option value="perdido">Perdido</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="field-item">
                                    <label className="field-label">
                                        Observaciones
                                    </label>
                                    <textarea
                                        name="observaciones"
                                        value={form.observaciones}
                                        onChange={handleInputChange}
                                        placeholder="Observaciones sobre la devolución (opcional)"
                                        rows="3"
                                        className="field-textarea"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <span>{editingReturn ? '✏️' : '📚'}</span>
                                        {loading ? 'Procesando...' : editingReturn ? 'Actualizar Devolución' : 'Registrar Devolución'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            clearMessages();
                                            setForm({
                                                prestamoId: '',
                                                fechaDevolucion: '',
                                                estado: 'devuelto',
                                                observaciones: '',
                                                condicionLibro: 'bueno'
                                            });
                                            setEditingReturn(null);
                                        }}
                                    >
                                        <span>🔄</span>
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Lista de devoluciones */
                        <div className="data-table-container crud-fade-in" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <div className="data-table-header books-header">
                                <span>📋</span>
                                Historial de Devoluciones
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar devolución por usuario o libro..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '400px' }}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {filteredReturns.length} de {returns.length} devoluciones
                                </span>
                            </div>

                            {(isAdmin() ? filteredReturns : filteredReturns.filter(r => {
                                const idMatch = r.usuario?._id === user?._id;
                                const emailMatch = r.usuario?.correo === user?.correo;
                                return idMatch || emailMatch;
                            })).length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">{searchTerm ? '🔍' : '📚'}</div>
                                    <h3 className="empty-title">
                                        {searchTerm
                                            ? 'No se encontraron devoluciones'
                                            : isAdmin() ? 'No hay devoluciones registradas' : 'No tienes devoluciones registradas'
                                        }
                                    </h3>
                                    <p className="empty-description">
                                        {searchTerm
                                            ? `No hay devoluciones que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
                                            : isAdmin() ? 'Las devoluciones aparecerán aquí cuando se registren' : 'Cuando devuelvas libros, aparecerán aquí'
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
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-column-user">Usuario</th>
                                            <th className="table-column-book">Libro</th>
                                            <th className="table-column-date">Fecha Real</th>
                                            <th className="table-column-date">Fecha Esperada</th>
                                            <th className="table-column-status">Estado</th>
                                            <th className="table-column-amount">Multa</th>
                                            <th className="table-column-actions">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(isAdmin() ? filteredReturns : filteredReturns.filter(r => {
                                            const idMatch = r.usuario?._id === user?._id;
                                            const emailMatch = r.usuario?.correo === user?.correo;
                                            return idMatch || emailMatch;
                                        })).map((returnItem) => (
                                            <tr key={returnItem._id} className="borrow-hover">
                                                <td>
                                                    <div className="table-text-primary">
                                                        {returnItem.usuario?.nombre} {returnItem.usuario?.apellido}
                                                    </div>
                                                    <div className="table-text-secondary">
                                                        {returnItem.usuario?.correo}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="table-text-primary">
                                                        {returnItem.libro?.titulo}
                                                    </div>
                                                    <div className="table-text-secondary">
                                                        ISBN: {returnItem.libro?.isbn}
                                                    </div>
                                                </td>
                                                <td>
                                                    {returnItem.fechaDevolucionReal ?
                                                        new Date(returnItem.fechaDevolucionReal).toLocaleDateString('es-ES') :
                                                        'No especificada'
                                                    }
                                                </td>
                                                <td>
                                                    {returnItem.fechaDevolucionEsperada ?
                                                        new Date(returnItem.fechaDevolucionEsperada).toLocaleDateString('es-ES') :
                                                        'No especificada'
                                                    }
                                                </td>
                                                <td>
                                                    {getStatusBadge(returnItem.estado === 'a_tiempo' ? 'devuelto' : returnItem.estado === 'retrasado' ? 'vencido' : returnItem.estado)}
                                                </td>
                                                <td>
                                                    <span className={returnItem.multa > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                                                        ${returnItem.multa || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isAdmin() ? (
                                                        <div className="table-actions">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDetailsClick(returnItem)}
                                                                title="Ver Detalles"
                                                            >
                                                                <span>👁️</span>
                                                                Ver Detalles
                                                            </button>
                                                            <button
                                                                className="btn btn-edit btn-sm"
                                                                onClick={() => handleEditClick(returnItem)}
                                                                title="Editar"
                                                            >
                                                                <span>✏️</span>
                                                                Editar
                                                            </button>
                                                            <button
                                                                className="btn btn-delete btn-sm"
                                                                onClick={() => handleDeleteClick(returnItem)}
                                                                title="Eliminar devolución"
                                                            >
                                                                <span>🗑️</span>
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="table-actions">
                                                            <button
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => handleDetailsClick(returnItem)}
                                                                title="Ver Detalles"
                                                            >
                                                                <span>👁️</span>
                                                                Ver Detalles
                                                            </button>
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

                    {/* Sección de Reportes */}
                    {showReports && isAdmin() && (
                        <div className="reports-content crud-fade-in">
                            <div className="reports-header">
                                <h2 className="reports-title">
                                    <span className="section-icon">📊</span>
                                    Reportes de Devoluciones
                                </h2>
                                <p className="reports-subtitle">
                                    Estadísticas y análisis del sistema de devoluciones
                                </p>
                                <div className="reports-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch('http://localhost:5001/api/reportes/devoluciones/pdf');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = 'devoluciones.pdf';
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
                                                const response = await fetch('http://localhost:5001/api/reportes/devoluciones/excel');
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.download = 'devoluciones.xlsx';
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
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a0f08' }}>
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-content">
                                        <h3>{returns.filter(r => r.estado === 'a_tiempo').length}</h3>
                                        <p>Devoluciones a Tiempo</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                                    <div className="stat-icon">⚠️</div>
                                    <div className="stat-content">
                                        <h3>{returns.filter(r => r.estado === 'retrasado').length}</h3>
                                        <p>Devoluciones Retrasadas</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #8B4513, #A0522D)', color: 'white' }}>
                                    <div className="stat-icon">💰</div>
                                    <div className="stat-content">
                                        <h3>${returns.reduce((sum, r) => sum + (r.multa || 0), 0)}</h3>
                                        <p>Total Multas</p>
                                    </div>
                                </div>
                                <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                                    <div className="stat-icon">📊</div>
                                    <div className="stat-content">
                                        <h3>{returns.length}</h3>
                                        <p>Total Devoluciones</p>
                                    </div>
                                </div>
                            </div>

                            {/* Gráfico de distribución por estados */}
                            <div className="chart-container">
                                <h3 className="chart-title">Distribución por Estados de Devolución</h3>
                                <div className="pie-chart">
                                    <div className="pie-svg">
                                        <svg viewBox="0 0 200 200" className="pie-svg">
                                            {(() => {
                                                const total = returns.length;
                                                if (total === 0) return null;

                                                const devueltoCount = returns.filter(r => r.estado === 'a_tiempo').length;
                                                const vencidoCount = returns.filter(r => r.estado === 'retrasado').length;

                                                const devueltoAngle = (devueltoCount / total) * 360;
                                                const vencidoAngle = (vencidoCount / total) * 360;

                                                return (
                                                    <>
                                                        {devueltoCount > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="#FFD700"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${devueltoAngle} ${360 - devueltoAngle}`}
                                                                transform="rotate(-90 100 100)"
                                                            />
                                                        )}
                                                        {vencidoCount > 0 && (
                                                            <circle
                                                                cx="100"
                                                                cy="100"
                                                                r="80"
                                                                fill="none"
                                                                stroke="#FF8C00"
                                                                strokeWidth="40"
                                                                strokeDasharray={`${vencidoAngle} ${360 - vencidoAngle}`}
                                                                transform={`rotate(${devueltoAngle - 90} 100 100)`}
                                                            />
                                                        )}
                                                    </>
                                                );
                                            })()}
                                            <circle cx="100" cy="100" r="30" fill="white" />
                                            <circle cx="100" cy="100" r="25" fill="var(--bg-primary)" />
                                        </svg>
                                        <div className="pie-center">
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                                                {returns.length}
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
                                                <strong>A Tiempo</strong><br />
                                                {returns.filter(r => r.estado === 'a_tiempo').length} ({((returns.filter(r => r.estado === 'a_tiempo').length / returns.length) * 100 || 0).toFixed(1)}%)
                                            </div>
                                        </div>
                                        <div className="pie-legend-item">
                                            <div className="pie-legend-color" style={{ backgroundColor: '#FF8C00' }}></div>
                                            <div className="pie-legend-text">
                                                <strong>Retrasadas</strong><br />
                                                {returns.filter(r => r.estado === 'retrasado').length} ({((returns.filter(r => r.estado === 'retrasado').length / returns.length) * 100 || 0).toFixed(1)}%)
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Libros más devueltos */}
                            <div className="chart-container">
                                <h3 className="chart-title">Libros Más Devueltos</h3>
                                <div className="top-list">
                                    {(() => {
                                        const bookStats = {};
                                        returns.forEach(returnItem => {
                                            const bookId = returnItem.libro?._id;
                                            const bookTitle = returnItem.libro?.titulo || 'Libro desconocido';
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
                                                        <div className="top-subtitle">Libro devuelto</div>
                                                    </div>
                                                    <div className="top-count">{data.count} devoluciones</div>
                                                </div>
                                            ));
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de detalles */}
            {showDetailsModal && returnDetails && (
                <div className="confirmation-modal-overlay" onClick={closeDetailsModal}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">📚</div>
                        <h3 className="confirmation-modal-title">Detalles de la Devolución</h3>

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
                                {returnDetails.libro?.titulo}
                            </div>
                            <div className="confirmation-modal-item-details">
                                Devuelto por {returnDetails.usuario?.nombre} {returnDetails.usuario?.apellido}
                            </div>
                        </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <strong>Usuario:</strong> {returnDetails.usuario?.nombre} {returnDetails.usuario?.apellido}
                            </div>
                            <div>
                                <strong>Correo:</strong> {returnDetails.usuario?.correo}
                            </div>
                            <div>
                                <strong>Libro:</strong> {returnDetails.libro?.titulo}
                            </div>
                            <div>
                                <strong>Autor:</strong> {returnDetails.libro?.autor?.nombre || 'No especificado'}
                            </div>
                            <div>
                                <strong>ISBN:</strong> {returnDetails.libro?.isbn || 'No especificado'}
                            </div>
                            <div>
                                <strong>Fecha de Devolución Real:</strong> {returnDetails.fechaDevolucionReal ?
                                    new Date(returnDetails.fechaDevolucionReal).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'No especificada'}
                            </div>
                            <div>
                                <strong>Fecha de Devolución Esperada:</strong> {returnDetails.fechaDevolucionEsperada ?
                                    new Date(returnDetails.fechaDevolucionEsperada).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : 'No especificada'}
                            </div>
                            <div>
                                <strong>Estado:</strong>
                                <span className={`status-badge ${returnDetails.estado === 'a_tiempo' ? 'status-devuelto' : returnDetails.estado === 'retrasado' ? 'status-vencido' : 'status-devuelto'}`} style={{ marginLeft: '0.5rem' }}>
                                    {returnDetails.estado === 'a_tiempo' ? 'A Tiempo' : returnDetails.estado === 'retrasado' ? 'Retrasado' : returnDetails.estado}
                                </span>
                            </div>
                            <div>
                                <strong>Condición del Libro:</strong> {returnDetails.condicionLibro || 'No especificada'}
                            </div>
                            <div>
                                <strong>Multa:</strong> <span className={returnDetails.multa > 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>${returnDetails.multa || 0}</span>
                            </div>
                            {returnDetails.observaciones && (
                                <div>
                                    <strong>Observaciones:</strong> {returnDetails.observaciones}
                                </div>
                            )}
                            <div>
                                <strong>Fecha de Registro:</strong> {returnDetails.createdAt ?
                                    new Date(returnDetails.createdAt).toLocaleDateString('es-ES', {
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
                                            handleEditClick(returnDetails);
                                        }}
                                    >
                                        <span>✏️</span>
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-delete btn-sm"
                                        onClick={() => {
                                            closeDetailsModal();
                                            handleDeleteClick(returnDetails);
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
            {showDeleteModal && returnToDelete && (
                <div className="confirmation-modal-overlay" onClick={cancelDelete}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">⚠️</div>
                        <h3 className="confirmation-modal-title">¿Eliminar Devolución?</h3>
                        <p className="confirmation-modal-message">
                            Esta acción revertirá el préstamo a estado activo. El libro volverá a estar disponible para préstamo.
                        </p>

                        <div className="confirmation-modal-item-info">
                             <div className="confirmation-modal-item-name">
                                 Devolución de "{returnToDelete.libro?.titulo}"
                             </div>
                             <div className="confirmation-modal-item-details">
                                 Usuario: {returnToDelete.usuario?.nombre} {returnToDelete.usuario?.apellido}
                                 {returnToDelete.fechaPrestamo && ` • Préstamo: ${new Date(returnToDelete.fechaPrestamo).toLocaleDateString('es-ES')}`}
                                 {returnToDelete.fechaDevolucion && ` • Devolución: ${new Date(returnToDelete.fechaDevolucion).toLocaleDateString('es-ES')}`}
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
                                <span>🔄</span>
                                Revertir a Activo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Returns;