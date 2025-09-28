import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAutores, createAutor, updateAutor, deleteAutor } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Authors = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        nombre: '',
        nacionalidad: '',
        fechaNacimiento: '',
        sitioWeb: '',
        biografia: '',
        imagenUrl: ''
    });
    const [authors, setAuthors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [authorToDelete, setAuthorToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [authorDetails, setAuthorDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingAuthor, setEditingAuthor] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReports, setShowReports] = useState(false);

    // Cargar autores al montar el componente
    useEffect(() => {
        loadAuthors();
    }, []);

    const loadAuthors = async () => {
        try {
            const data = await getAutores();
            // Manejar nueva estructura con paginación
            const authorsArray = data.autores || data;
            setAuthors(Array.isArray(authorsArray) ? authorsArray : []);
        } catch (error) {
            console.error('Error cargando autores:', error);
            setAuthors([]);
        }
    };

    // Filtrar autores por nombre
    const filteredAuthors = authors.filter(author =>
        author && author.nombre && author.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
            const authorData = {
                nombre: form.nombre,
                nacionalidad: form.nacionalidad,
                fechaNacimiento: form.fechaNacimiento ? new Date(form.fechaNacimiento) : null,
                sitioWeb: form.sitioWeb,
                biografia: form.biografia,
                imagenUrl: form.imagenUrl
            };

            if (editingAuthor) {
                await updateAutor(editingAuthor._id, authorData);
                setSuccess('Autor actualizado exitosamente!');
                setShowSuccessModal(true);
            } else {
                await createAutor(authorData);
                setSuccess('Autor registrado exitosamente!');
                setShowSuccessModal(true);
            }

            await loadAuthors();

            // Limpiar formulario
            setForm({
                nombre: '',
                nacionalidad: '',
                fechaNacimiento: '',
                sitioWeb: '',
                biografia: '',
                imagenUrl: ''
            });
            setEditingAuthor(null);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al guardar el autor');
        } finally {
            setLoading(false);
        }
    };

    const deleteAuthor = async (id) => {
        try {
            await deleteAutor(id);
            await loadAuthors();
        } catch (error) {
            console.error('Error eliminando autor:', error);
            alert('Error al eliminar el autor');
        }
    };

    const handleDeleteClick = (author) => {
        setAuthorToDelete(author);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (authorToDelete) {
            deleteAuthor(authorToDelete._id);
            setShowDeleteModal(false);
            setAuthorToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAuthorToDelete(null);
    };

    const handleDetailsClick = (author) => {
        setAuthorDetails(author);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setAuthorDetails(null);
    };



    return (
        <div className="page">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title">📖 {isAdmin() ? 'Gestión de Autores' : 'Catálogo de Autores'}</h1>
                    <p className="page-subtitle">
                        {isAdmin() ? 'Registra y administra los autores de tu biblioteca' : 'Explora los autores disponibles en la biblioteca'}
                    </p>
                </div>

                <div className="crud-content">
                    {/* Mensajes de error y éxito */}
                    {error && (
                        <div className="alert-overlay" onClick={() => setError('')}>
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
                                    if (!editingAuthor) {
                                        setForm({
                                            nombre: '',
                                            nacionalidad: '',
                                            fechaNacimiento: '',
                                            sitioWeb: '',
                                            biografia: '',
                                            imagenUrl: ''
                                        });
                                    }
                                }}
                            >
                                {editingAuthor ? '✏️ Editando Autor' : '➕ Registrar Autor'}
                            </button>
                        )}
                        <button
                            className={`tab-button ${!showForm || !isAdmin() && !showForm ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                                if (editingAuthor) {
                                    setEditingAuthor(null);
                                    setForm({
                                        nombre: '',
                                        nacionalidad: '',
                                        fechaNacimiento: '',
                                        sitioWeb: '',
                                        biografia: '',
                                        imagenUrl: ''
                                    });
                                }
                            }}
                        >
                            📋 Lista de Autores ({filteredAuthors.length})
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
                                    <span className="section-icon">{editingAuthor ? '✏️' : '📝'}</span>
                                    {editingAuthor ? 'Editar Autor' : 'Nuevo Autor'}
                                </h2>
                                <p className="section-description">
                                    {editingAuthor
                                        ? 'Modifica la información del autor seleccionado'
                                        : 'Completa la información del autor para agregarlo a tu biblioteca'
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
                                            placeholder="Nombre del autor"
                                            required
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Fecha de Nacimiento
                                        </label>
                                        <input
                                            type="date"
                                            name="fechaNacimiento"
                                            value={form.fechaNacimiento}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            Nacionalidad
                                        </label>
                                        <input
                                            type="text"
                                            name="nacionalidad"
                                            value={form.nacionalidad}
                                            onChange={handleInputChange}
                                            placeholder="País de origen"
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Sitio Web
                                        </label>
                                        <input
                                            type="url"
                                            name="sitioWeb"
                                            value={form.sitioWeb}
                                            onChange={handleInputChange}
                                            placeholder="https://ejemplo.com"
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            URL de Imagen
                                        </label>
                                        <input
                                            type="url"
                                            name="imagenUrl"
                                            value={form.imagenUrl}
                                            onChange={handleInputChange}
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                <div className="field-item">
                                    <label className="field-label">
                                        Biografía
                                    </label>
                                    <textarea
                                        name="biografia"
                                        value={form.biografia}
                                        onChange={handleInputChange}
                                        placeholder="Breve biografía del autor"
                                        rows="4"
                                        className="field-textarea"
                                    />
                                </div>

                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <span>{editingAuthor ? '✏️' : '📝'}</span>
                                        {loading ? 'Guardando...' : editingAuthor ? 'Actualizar Autor' : 'Registrar Autor'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            clearMessages();
                                            setForm({
                                                nombre: '',
                                                nacionalidad: '',
                                                fechaNacimiento: '',
                                                sitioWeb: '',
                                                biografia: '',
                                                imagenUrl: ''
                                            });
                                            setEditingAuthor(null);
                                        }}
                                    >
                                        <span>🔄</span>
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Lista de autores */
                        <div className="data-table-container crud-fade-in" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <div className="data-table-header books-header">
                                <span>📋</span>
                                Autores Registrados
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar autor por nombre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '400px' }}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {filteredAuthors.length} de {authors.length} autores
                                </span>
                            </div>

                            {filteredAuthors.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">🔍</div>
                                    <h3 className="empty-title">
                                        {searchTerm ? 'No se encontraron autores' : 'No hay autores registrados'}
                                    </h3>
                                    <p className="empty-description">
                                        {searchTerm
                                            ? `No hay autores que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
                                            : isAdmin() ? 'Registra tu primer autor usando el formulario' : 'Los autores serán registrados por el administrador'
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
                                            Registrar Primer Autor
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-image-column">Imagen</th>
                                            <th className="table-column-name">Nombre</th>
                                            <th className="table-column-nationality">Nacionalidad</th>
                                            <th className="table-column-date">Fecha Nacimiento</th>
                                            <th className="table-column-website">Sitio Web</th>
                                            <th className="table-column-biography">Biografía</th>
                                            <th className="table-column-actions">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAuthors.map((author) => (
                                            <tr key={author._id}>
                                                <td className="table-image-column">
                                                    {author.imagenUrl && author.imagenUrl.trim() ? (
                                                        <img
                                                            src={author.imagenUrl}
                                                            alt={author.nombre}
                                                            className="author-image-large"
                                                        />
                                                    ) : (
                                                        <div className="author-image-placeholder">
                                                            👤
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="table-text-primary">
                                                        {author.nombre}
                                                    </div>
                                                </td>
                                                <td>{author.nacionalidad || 'No especificada'}</td>
                                                <td>
                                                    {author.fechaNacimiento ?
                                                        new Date(author.fechaNacimiento).toLocaleDateString('es-ES') :
                                                        'No especificada'
                                                    }
                                                </td>
                                                <td>
                                                    {author.sitioWeb && author.sitioWeb.trim() ? (
                                                        <a
                                                            href={author.sitioWeb}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="link-primary"
                                                        >
                                                            🌐 Ver sitio
                                                        </a>
                                                    ) : (
                                                        'No disponible'
                                                    )}
                                                </td>
                                                <td>
                                                    {author.biografia ? (
                                                        <div className="table-text-secondary table-text-clamp">
                                                            {author.biografia}
                                                        </div>
                                                    ) : (
                                                        'Sin biografía'
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleDetailsClick(author)}
                                                            title="Ver Detalles"
                                                        >
                                                            <span>👁️</span>
                                                            Ver Detalles
                                                        </button>
                                                        {isAdmin() && (
                                                            <>
                                                                <button
                                                                    className="btn btn-edit btn-sm"
                                                                    onClick={() => {
                                                                        setForm({
                                                                            nombre: author.nombre,
                                                                            nacionalidad: author.nacionalidad,
                                                                            fechaNacimiento: author.fechaNacimiento ?
                                                                                new Date(author.fechaNacimiento).toISOString().split('T')[0] : '',
                                                                            sitioWeb: author.sitioWeb || '',
                                                                            biografia: author.biografia || '',
                                                                            imagenUrl: author.imagenUrl || ''
                                                                        });
                                                                        setEditingAuthor(author);
                                                                        setShowForm(true);
                                                                    }}
                                                                    title="Editar"
                                                                >
                                                                    <span>✏️</span>
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    className="btn btn-delete btn-sm"
                                                                    onClick={() => handleDeleteClick(author)}
                                                                    title="Eliminar"
                                                                >
                                                                    <span>🗑️</span>
                                                                    Eliminar
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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
                            Reportes de Autores
                        </h2>
                        <p className="reports-subtitle">
                            Estadísticas y análisis de los autores registrados
                        </p>
                        <div className="reports-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    try {
                                        const response = await fetch('http://localhost:5001/api/reportes/autores/pdf');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'autores.pdf';
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
                                        const response = await fetch('http://localhost:5001/api/reportes/autores/excel');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'autores.xlsx';
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
                            <div className="stat-icon">✍️</div>
                            <div className="stat-content">
                                <h3>{authors.length}</h3>
                                <p>Total Autores</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                            <div className="stat-icon">🌍</div>
                            <div className="stat-content">
                                <h3>{new Set(authors.map(author => author.nacionalidad).filter(Boolean)).size}</h3>
                                <p>Nacionalidades</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a0f08' }}>
                            <div className="stat-icon">🔗</div>
                            <div className="stat-content">
                                <h3>{authors.filter(author => author.sitioWeb && author.sitioWeb.trim()).length}</h3>
                                <p>Con Sitio Web</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                            <div className="stat-icon">📸</div>
                            <div className="stat-content">
                                <h3>{authors.filter(author => author.imagenUrl && author.imagenUrl.trim()).length}</h3>
                                <p>Con Imagen</p>
                            </div>
                        </div>
                    </div>

                    {/* Autores más prolíficos */}
                    <div className="chart-container">
                        <h3 className="chart-title">Autores Más Prolíficos</h3>
                        <div className="top-list">
                            {authors
                                .sort((a, b) => (b.libros?.length || 0) - (a.libros?.length || 0))
                                .slice(0, 5)
                                .map((author, index) => (
                                    <div key={author._id} className="top-item">
                                        <div className="top-rank">{index + 1}</div>
                                        <div className="top-info">
                                            <div className="top-title">{author.nombre}</div>
                                            <div className="top-subtitle">{author.nacionalidad || 'Nacionalidad no especificada'}</div>
                                        </div>
                                        <div className="top-count">{author.libros?.length || 0} libros</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalles */}
            {showDetailsModal && authorDetails && (
                <div className="confirmation-modal-overlay" onClick={closeDetailsModal}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">👤</div>
                        <h3 className="confirmation-modal-title">Detalles del Autor</h3>

                        <div className="confirmation-modal-item-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                {authorDetails.imagenUrl && authorDetails.imagenUrl.trim() ? (
                                    <img
                                        src={authorDetails.imagenUrl}
                                        alt={authorDetails.nombre}
                                        style={{
                                            width: '120px',
                                            height: '120px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '3px solid var(--primary)',
                                            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '120px',
                                        height: '120px',
                                        borderRadius: '50%',
                                        background: 'var(--gradient-primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        margin: '0 auto',
                                        boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                    }}>
                                        👤
                                    </div>
                                )}
                            </div>
                            <div className="confirmation-modal-item-name" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {authorDetails.nombre}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                                <div>
                                    <strong>Nacionalidad:</strong> {authorDetails.nacionalidad || 'No especificada'}
                                </div>
                                <div>
                                    <strong>Fecha de Nacimiento:</strong> {authorDetails.fechaNacimiento ?
                                        new Date(authorDetails.fechaNacimiento).toLocaleDateString('es-ES') :
                                        'No especificada'}
                                </div>
                                <div>
                                    <strong>Sitio Web:</strong> {authorDetails.sitioWeb && authorDetails.sitioWeb.trim() ? (
                                        <a
                                            href={authorDetails.sitioWeb}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="link-primary"
                                            style={{ color: 'var(--primary)' }}
                                        >
                                            🌐 {authorDetails.sitioWeb}
                                        </a>
                                    ) : (
                                        'No disponible'
                                    )}
                                </div>
                                <div>
                                    <strong>Biografía:</strong>
                                    <div style={{
                                        marginTop: '0.5rem',
                                        padding: '1rem',
                                        background: 'var(--bg-secondary)',
                                        borderRadius: '8px',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {authorDetails.biografia || 'Sin biografía disponible'}
                                    </div>
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
            {showDeleteModal && authorToDelete && (
                <div className="confirmation-modal-overlay" onClick={cancelDelete}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">⚠️</div>
                        <h3 className="confirmation-modal-title">¿Eliminar Autor?</h3>
                        <p className="confirmation-modal-message">
                            Esta acción no se puede deshacer. El autor será eliminado permanentemente.
                        </p>

                        <div className="confirmation-modal-item-info">
                             <div className="confirmation-modal-item-name">
                                 {authorToDelete.nombre}
                             </div>
                             <div className="confirmation-modal-item-details">
                                 {authorToDelete.nacionalidad && `Nacionalidad: ${authorToDelete.nacionalidad}`}
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

export default Authors;

