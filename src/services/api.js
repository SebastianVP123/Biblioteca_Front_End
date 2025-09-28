const API_BASE_URL = 'http://localhost:5001/api';

// Función helper para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Autores
export const getAutores = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/autores${queryString ? `?${queryString}` : ''}`);
};
export const getAutor = (id) => apiRequest(`/autores/${id}`);
export const createAutor = (autor) => apiRequest('/autores', {
  method: 'POST',
  body: JSON.stringify(autor),
});
export const updateAutor = (id, autor) => apiRequest(`/autores/${id}`, {
  method: 'PUT',
  body: JSON.stringify(autor),
});
export const deleteAutor = (id) => apiRequest(`/autores/${id}`, {
  method: 'DELETE',
});

// Libros
export const getLibros = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/libros${queryString ? `?${queryString}` : ''}`);
};
export const getLibro = (id) => apiRequest(`/libros/${id}`);
export const createLibro = (libro) => apiRequest('/libros', {
  method: 'POST',
  body: JSON.stringify(libro),
});
export const updateLibro = (id, libro) => apiRequest(`/libros/${id}`, {
  method: 'PUT',
  body: JSON.stringify(libro),
});
export const deleteLibro = (id) => apiRequest(`/libros/${id}`, {
  method: 'DELETE',
});
export const getLibrosDisponibles = () => apiRequest('/libros/disponibles');

// Usuarios - Fallback a localStorage si API falla
export const getUsuarios = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    return await apiRequest(`/usuarios${queryString ? `?${queryString}` : ''}`);
  } catch (error) {
    console.log('API no disponible, usando localStorage');
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    return users;
  }
};

export const getUsuario = async (id) => {
  try {
    return await apiRequest(`/usuarios/${id}`);
  } catch (error) {
    console.log('API no disponible, usando localStorage');
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    return users.find(u => u._id === id);
  }
};

export const createUsuario = async (usuario) => {
  try {
    return await apiRequest('/usuarios', {
      method: 'POST',
      body: JSON.stringify({ ...usuario, rol: usuario.rol || 'user' }),
    });
  } catch (error) {
    console.log('API no disponible, guardando en localStorage');
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const newUser = {
      ...usuario,
      _id: Date.now().toString(),
      rol: usuario.rol || 'user', // Rol por defecto 'user'
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem('appUsers', JSON.stringify(users));
    return newUser;
  }
};

export const updateUsuario = async (id, usuario) => {
  try {
    return await apiRequest(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    });
  } catch (error) {
    console.log('API no disponible, actualizando en localStorage');
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const index = users.findIndex(u => u._id === id);
    if (index !== -1) {
      users[index] = { ...users[index], ...usuario };
      localStorage.setItem('appUsers', JSON.stringify(users));
      return users[index];
    }
    throw new Error('Usuario no encontrado');
  }
};

export const deleteUsuario = async (id) => {
  try {
    return await apiRequest(`/usuarios/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.log('API no disponible, eliminando de localStorage');
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const filteredUsers = users.filter(u => u._id !== id);
    localStorage.setItem('appUsers', JSON.stringify(filteredUsers));
    return { message: 'Usuario eliminado' };
  }
};

export const loginUsuario = async (credentials) => {
  try {
    return await apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  } catch (error) {
    console.log('API no disponible, verificando credenciales locales');
    // Verificar admin por defecto
    if (credentials.correo === 'admin@biblioteca.com' && credentials.contrasena === 'admin123') {
      return {
        usuario: {
          _id: 'admin-default-123',
          nombre: 'Administrador',
          correo: 'admin@biblioteca.com',
          rol: 'admin',
          createdAt: new Date().toISOString()
        }
      };
    }

    // Verificar usuarios registrados
    const users = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const user = users.find(u => u.correo === credentials.correo && u.contrasena === credentials.contrasena);

    if (user) {
      const { contrasena: _, ...userWithoutPassword } = user;
      return { usuario: userWithoutPassword };
    }

    throw new Error('Credenciales inválidas');
  }
};


// Préstamos
export const getPrestamos = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/prestamos${queryString ? `?${queryString}` : ''}`);
};
export const getPrestamo = (id) => apiRequest(`/prestamos/${id}`);
export const createPrestamo = (prestamo) => apiRequest('/prestamos', {
  method: 'POST',
  body: JSON.stringify(prestamo),
});
export const updatePrestamo = (id, prestamo) => apiRequest(`/prestamos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(prestamo),
});
export const deletePrestamo = (id) => apiRequest(`/prestamos/${id}`, {
  method: 'DELETE',
});

// Devoluciones
export const getDevoluciones = (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return apiRequest(`/devoluciones${queryString ? `?${queryString}` : ''}`);
};
export const getDevolucion = (id) => apiRequest(`/devoluciones/${id}`);
export const createDevolucion = (devolucion) => apiRequest('/devoluciones', {
  method: 'POST',
  body: JSON.stringify(devolucion),
});
export const updateDevolucion = (id, devolucion) => apiRequest(`/devoluciones/${id}`, {
  method: 'PUT',
  body: JSON.stringify(devolucion),
});
export const deleteDevolucion = (id) => apiRequest(`/devoluciones/${id}`, {
  method: 'DELETE',
});

// Reportes y Estadísticas
export const getEstadisticasGenerales = () => apiRequest('/reportes/estadisticas-generales');
export const getPrestamosPorMes = (year) => apiRequest(`/reportes/prestamos-por-mes?year=${year}`);
export const getUsuariosPorRol = () => apiRequest('/reportes/usuarios-por-rol');
export const getLibrosPorGenero = () => apiRequest('/reportes/libros-por-genero');
export const getPrestamosVencidos = () => apiRequest('/reportes/prestamos-vencidos');
export const getDashboardAdmin = () => apiRequest('/reportes/dashboard-admin');