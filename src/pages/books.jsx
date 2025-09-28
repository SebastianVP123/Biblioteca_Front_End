import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLibros, createLibro, updateLibro, deleteLibro, getAutores } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const Books = () => {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        titulo: '',
        autor: '',
        genero: '',
        anioPublicacion: '',
        isbn: '',
        imagenUrl: '',
        idiomaOriginal: 'Español',
        existencias: 1
    });
    const [books, setBooks] = useState([]);
    const [autores, setAutores] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [bookDetails, setBookDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editingBook, setEditingBook] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showReports, setShowReports] = useState(false);

    // Cargar libros y autores al montar el componente
    useEffect(() => {
        loadBooks();
        loadAutores();
    }, []);

    const loadBooks = async () => {
        try {
            const data = await getLibros();
            // Manejar nueva estructura con paginación
            const booksArray = data.libros || data;
            setBooks(Array.isArray(booksArray) ? booksArray : []);
        } catch (error) {
            console.error('Error cargando libros:', error);
            setBooks([]);
        }
    };

    // Filtrar libros por título o autor
    const filteredBooks = books.filter(book =>
        book && book.titulo && (
            book.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (book.autor?.nombre && book.autor.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const loadAutores = async () => {
        try {
            const data = await getAutores();
            // Manejar nueva estructura con paginación
            const autoresArray = data.autores || data;
            setAutores(Array.isArray(autoresArray) ? autoresArray : []);
        } catch (error) {
            console.error('Error cargando autores:', error);
            setAutores([]);
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
            const bookData = {
                titulo: form.titulo,
                autor: form.autor,
                genero: form.genero,
                anioPublicacion: parseInt(form.anioPublicacion),
                isbn: form.isbn,
                imagenUrl: form.imagenUrl,
                idiomaOriginal: form.idiomaOriginal,
                existencias: parseInt(form.existencias) || 1
            };

            if (editingBook) {
                await updateLibro(editingBook._id, bookData);
                setSuccess('Libro actualizado exitosamente!');
                setShowSuccessModal(true);
            } else {
                await createLibro(bookData);
                setSuccess('Libro registrado exitosamente!');
                setShowSuccessModal(true);
            }

            await loadBooks();

            // Limpiar formulario
            setForm({
                titulo: '',
                autor: '',
                genero: '',
                anioPublicacion: '',
                isbn: '',
                imagenUrl: '',
                idiomaOriginal: 'Español',
                estado: 'disponible'
            });
            setEditingBook(null);

        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al guardar el libro');
        } finally {
            setLoading(false);
        }
    };

    const deleteBook = async (id) => {
        try {
            await deleteLibro(id);
            await loadBooks();
        } catch (error) {
            console.error('Error eliminando libro:', error);
            alert('Error al eliminar el libro');
        }
    };

    const handleDeleteClick = (book) => {
        setBookToDelete(book);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (bookToDelete) {
            deleteBook(bookToDelete._id);
            setShowDeleteModal(false);
            setBookToDelete(null);
        }
    };


    const cancelDelete = () => {
        setShowDeleteModal(false);
        setBookToDelete(null);
    };

    const handleDetailsClick = (book) => {
        setBookDetails(book);
        setShowDetailsModal(true);
    };

    const closeDetailsModal = () => {
        setShowDetailsModal(false);
        setBookDetails(null);
    };

    return (
        <div className="page">
            <div className="container">
                <div className="text-center" style={{ marginBottom: '3rem' }}>
                    <h1 className="page-title">📚 {isAdmin() ? 'Gestión de Libros' : 'Catálogo de Libros'}</h1>
                    <p className="page-subtitle">
                        {isAdmin() ? 'Registra y administra los libros de tu biblioteca' : 'Explora los libros disponibles en la biblioteca'}
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
                                }}
                            >
                                ➕ Registrar Libro
                            </button>
                        )}
                        <button
                            className={`tab-button ${!showForm || !isAdmin() && !showForm ? 'active' : ''}`}
                            onClick={() => {
                                clearMessages();
                                setShowForm(false);
                            }}
                        >
                            📋 Lista de Libros ({filteredBooks.length})
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
                                    <span className="section-icon">📝</span>
                                    Nuevo Libro
                                </h2>
                                <p className="section-description">
                                    Completa la información del libro para agregarlo a tu biblioteca
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} style={{ maxWidth: '1000px', margin: '0 auto' }}>
                                {/* Título y Autor */}
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Título *
                                        </label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            value={form.titulo}
                                            onChange={handleInputChange}
                                            placeholder="Título del libro"
                                            required
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Autor *
                                        </label>
                                        <select
                                            name="autor"
                                            value={form.autor}
                                            onChange={handleInputChange}
                                            required
                                            className="field-input"
                                        >
                                            <option value="">Seleccionar autor</option>
                                            {autores.map(autor => (
                                                <option key={autor._id} value={autor._id}>
                                                    {autor.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Género, Idioma y Año */}
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            Género
                                        </label>
                                        <input
                                            type="text"
                                            name="genero"
                                            value={form.genero}
                                            onChange={handleInputChange}
                                            placeholder="Género literario"
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label">
                                            Idioma Original
                                        </label>
                                        <select
                                            name="idiomaOriginal"
                                            value={form.idiomaOriginal}
                                            onChange={handleInputChange}
                                            className="field-input"
                                        >
                                            <option value="Español">Español</option>
                                            <option value="Inglés">Inglés</option>
                                            <option value="Francés">Francés</option>
                                            <option value="Alemán">Alemán</option>
                                            <option value="Italiano">Italiano</option>
                                            <option value="Portugués">Portugués</option>
                                            <option value="Otro">Otro</option>
                                        </select>
                                    </div>


                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Año de Publicación *
                                        </label>
                                        <input
                                            type="number"
                                            name="anioPublicacion"
                                            value={form.anioPublicacion}
                                            onChange={handleInputChange}
                                            placeholder="2024"
                                            required
                                            className="field-input"
                                        />
                                    </div>
                                </div>

                                {/* ISBN, Existencias e Imagen */}
                                <div className="field-group">
                                    <div className="field-item">
                                        <label className="field-label">
                                            ISBN
                                        </label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={form.isbn}
                                            onChange={handleInputChange}
                                            placeholder="978-0-123456-78-9"
                                            className="field-input"
                                        />
                                    </div>

                                    <div className="field-item">
                                        <label className="field-label field-required">
                                            Existencias
                                        </label>
                                        <input
                                            type="number"
                                            name="existencias"
                                            value={form.existencias}
                                            onChange={handleInputChange}
                                            placeholder="1"
                                            min="0"
                                            required
                                            className="field-input"
                                        />
                                    </div>

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

                                {/* Botones */}
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        <span>📚</span>
                                        {loading ? 'Guardando...' : editingBook ? 'Actualizar Libro' : 'Registrar Libro'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            clearMessages();
                                            setForm({
                                                titulo: '',
                                                autor: '',
                                                genero: '',
                                                anioPublicacion: '',
                                                isbn: '',
                                                imagenUrl: '',
                                                idiomaOriginal: 'Español',
                                                existencias: 1
                                            });
                                            setEditingBook(null);
                                        }}
                                    >
                                        <span>🔄</span>
                                        Limpiar
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Lista de libros */
                        <div className="data-table-container crud-fade-in" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                            <div className="data-table-header books-header">
                                <span>📋</span>
                                Libros Registrados
                            </div>

                            {/* Barra de búsqueda */}
                            <div className="search-bar" style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar libro por título o autor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="search-input"
                                    style={{ flex: 1, maxWidth: '400px' }}
                                />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    {filteredBooks.length} de {books.length} libros
                                </span>
                            </div>

                            {filteredBooks.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon">{searchTerm ? '🔍' : '📚'}</div>
                                    <h3 className="empty-title">
                                        {searchTerm ? 'No se encontraron libros' : 'No hay libros registrados'}
                                    </h3>
                                    <p className="empty-description">
                                        {searchTerm
                                            ? `No hay libros que coincidan con "${searchTerm}". Intenta con otro término de búsqueda.`
                                            : isAdmin() ? 'Registra tu primer libro usando el formulario' : 'Los libros serán registrados por el administrador'
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
                                            Registrar Primer Libro
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th className="table-image-column">Imagen</th>
                                            <th className="table-column-title">Título</th>
                                            <th className="table-column-author">Autor</th>
                                            <th className="table-column-genre">Género</th>
                                            <th className="table-column-year">Año</th>
                                            <th className="table-column-isbn">ISBN</th>
                                            <th className="table-column-stock">Existencias</th>
                                            <th className="table-column-actions">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredBooks.map((book) => (
                                            <tr key={book._id}>
                                                <td className="table-image-column">
                                                    {book.imagenUrl && book.imagenUrl.trim() ? (
                                                        <img
                                                            src={book.imagenUrl}
                                                            alt={book.titulo}
                                                            className="book-image-large"
                                                        />
                                                    ) : (
                                                        <div className="book-image-placeholder">
                                                            📖
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="table-text-primary">
                                                        {book.titulo}
                                                    </div>
                                                </td>
                                                <td>{book.autor?.nombre || 'Sin autor'}</td>
                                                <td>{book.genero || 'Sin género'}</td>
                                                <td>{book.anioPublicacion}</td>
                                                <td>{book.isbn || 'Sin ISBN'}</td>
                                                <td>{book.existencias || 0}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => handleDetailsClick(book)}
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
                                                                            titulo: book.titulo,
                                                                            autor: book.autor?._id,
                                                                            genero: book.genero,
                                                                            anioPublicacion: book.anioPublicacion,
                                                                            isbn: book.isbn,
                                                                            imagenUrl: book.imagenUrl || '',
                                                                            idiomaOriginal: book.idiomaOriginal || 'Español',
                                                                            existencias: book.existencias || 1
                                                                        });
                                                                        setEditingBook(book);
                                                                        setShowForm(true);
                                                                    }}
                                                                    title="Editar libro"
                                                                >
                                                                    <span>✏️</span>
                                                                    Editar
                                                                </button>
                                                                <button
                                                                    className="btn btn-delete btn-sm"
                                                                    onClick={() => handleDeleteClick(book)}
                                                                    title="Eliminar libro"
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
                            Reportes de Libros
                        </h2>
                        <p className="reports-subtitle">
                            Estadísticas y análisis del catálogo de libros
                        </p>
                        <div className="reports-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <button
                                className="btn btn-primary"
                                onClick={async () => {
                                    try {
                                        const response = await fetch('http://localhost:5001/api/reportes/libros/pdf');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'libros.pdf';
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
                                        const response = await fetch('http://localhost:5001/api/reportes/libros/excel');
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = 'libros.xlsx';
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
                            <div className="stat-icon">📚</div>
                            <div className="stat-content">
                                <h3>{books.length}</h3>
                                <p>Total Libros</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #228B22, #32CD32)', color: 'white' }}>
                            <div className="stat-icon">📖</div>
                            <div className="stat-content">
                                <h3>{books.reduce((sum, book) => sum + (book.existencias || 0), 0)}</h3>
                                <p>Total Ejemplares</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#1a0f08' }}>
                            <div className="stat-icon">✍️</div>
                            <div className="stat-content">
                                <h3>{new Set(books.map(book => book.autor?._id).filter(Boolean)).size}</h3>
                                <p>Autores Únicos</p>
                            </div>
                        </div>
                        <div className="stat-card" style={{ background: 'linear-gradient(135deg, #FF8C00, #FFA500)', color: 'white' }}>
                            <div className="stat-icon">📅</div>
                            <div className="stat-content">
                                <h3>{books.filter(book => {
                                    const currentYear = new Date().getFullYear();
                                    return book.anioPublicacion === currentYear;
                                }).length}</h3>
                                <p>Libros {new Date().getFullYear()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Gráfico de distribución por géneros */}
                    <div className="chart-container">
                        <h3 className="chart-title">Distribución por Géneros</h3>
                        <div className="bar-chart">
                            {(() => {
                                const genres = {};
                                books.forEach(book => {
                                    const genre = book.genero || 'Sin género';
                                    genres[genre] = (genres[genre] || 0) + 1;
                                });

                                const topGenres = Object.entries(genres)
                                    .sort(([,a], [,b]) => b - a)
                                    .slice(0, 5);

                                const maxCount = Math.max(...topGenres.map(([, count]) => count));

                                return topGenres.map(([genre, count], index) => (
                                    <div key={genre} className="bar-item">
                                        <div className="bar-label">{genre}</div>
                                        <div className="bar-container">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    width: `${(count / maxCount) * 100}%`,
                                                    backgroundColor: `hsl(${index * 60}, 70%, 50%)`
                                                }}
                                            ></div>
                                        </div>
                                        <div className="bar-count">{count}</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>

                    {/* Libros más populares (por existencias) */}
                    <div className="chart-container">
                        <h3 className="chart-title">Libros con Más Existencias</h3>
                        <div className="top-list">
                            {books
                                .sort((a, b) => (b.existencias || 0) - (a.existencias || 0))
                                .slice(0, 5)
                                .map((book, index) => (
                                    <div key={book._id} className="top-item">
                                        <div className="top-rank">{index + 1}</div>
                                        <div className="top-info">
                                            <div className="top-title">{book.titulo}</div>
                                            <div className="top-subtitle">{book.autor?.nombre || 'Sin autor'}</div>
                                        </div>
                                        <div className="top-count">{book.existencias || 0} unidades</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalles */}
            {showDetailsModal && bookDetails && (
                <div className="confirmation-modal-overlay" onClick={closeDetailsModal}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">📖</div>
                        <h3 className="confirmation-modal-title">Detalles del Libro</h3>

                        <div className="confirmation-modal-item-info" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                {bookDetails.imagenUrl && bookDetails.imagenUrl.trim() ? (
                                    <img
                                        src={bookDetails.imagenUrl}
                                        alt={bookDetails.titulo}
                                        style={{
                                            width: '120px',
                                            height: '160px',
                                            objectFit: 'cover',
                                            borderRadius: '8px',
                                            border: '3px solid var(--primary)',
                                            boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                        }}
                                    />
                                ) : (
                                    <div style={{
                                        width: '120px',
                                        height: '160px',
                                        background: 'var(--gradient-primary)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '3rem',
                                        margin: '0 auto',
                                        boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)'
                                    }}>
                                        📖
                                    </div>
                                )}
                            </div>
                            <div className="confirmation-modal-item-name" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                {bookDetails.titulo}
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                                <div>
                                    <strong>Autor:</strong> {bookDetails.autor?.nombre || 'Sin autor especificado'}
                                </div>
                                <div>
                                    <strong>Género:</strong> {bookDetails.genero || 'Sin género especificado'}
                                </div>
                                <div>
                                    <strong>Año de Publicación:</strong> {bookDetails.anioPublicacion || 'No especificado'}
                                </div>
                                <div>
                                    <strong>Idioma Original:</strong> {bookDetails.idiomaOriginal || 'No especificado'}
                                </div>
                                <div>
                                    <strong>ISBN:</strong> {bookDetails.isbn || 'No especificado'}
                                </div>
                                <div>
                                    <strong>Existencias:</strong> {bookDetails.existencias || 0} unidades
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
            {showDeleteModal && bookToDelete && (
                <div className="confirmation-modal-overlay" onClick={cancelDelete}>
                    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="confirmation-modal-icon">⚠️</div>
                        <h3 className="confirmation-modal-title">¿Eliminar Libro?</h3>
                        <p className="confirmation-modal-message">
                            Esta acción no se puede deshacer. El libro será eliminado permanentemente.
                        </p>

                        <div className="confirmation-modal-item-info">
                             <div className="confirmation-modal-item-name">
                                 {bookToDelete.titulo}
                             </div>
                             <div className="confirmation-modal-item-details">
                                 {bookToDelete.autor?.nombre && `Autor: ${bookToDelete.autor.nombre}`}
                                 {bookToDelete.anioPublicacion && ` • Año: ${bookToDelete.anioPublicacion}`}
                                 {bookToDelete.genero && ` • Género: ${bookToDelete.genero}`}
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

export default Books;