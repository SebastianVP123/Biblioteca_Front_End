import { createContext, useContext, useState, useEffect } from 'react';
import { sendPasswordResetEmail, verifyResetCode, markResetCodeAsUsed, clearResetCode } from '../services/emailService';
import { emailExists } from '../utils/userHelpers';
import { updateUsuario } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const initializeAuth = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem('currentUser');
        }
      } else {
        // Crear usuario admin por defecto para pruebas
        const defaultAdmin = {
          _id: 'admin-default-123',
          nombre: 'Administrador',
          correo: 'admin@biblioteca.com',
          rol: 'admin',
          createdAt: new Date().toISOString()
        };
        setUser(defaultAdmin);
        localStorage.setItem('currentUser', JSON.stringify(defaultAdmin));
        console.log('👑 Usuario admin por defecto creado para pruebas');
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    // Asegurarse de que userData es un objeto válido
    if (userData && typeof userData === 'object') {
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = async (userData) => {
    try {
      if (!user || !user._id) {
        throw new Error('No hay usuario autenticado');
      }

      const updatedUser = await updateUsuario(user._id, userData);
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Funciones para verificar roles
  const isAdmin = () => {
    return user && user.rol === 'admin';
  };

  const isUser = () => {
    return user && user.rol === 'user';
  };

  const hasRole = (role) => {
    return user && user.rol === role;
  };

  const requestPasswordReset = async (email) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verificar si el email existe en el sistema
      if (!emailExists(email)) {
        setError('No existe una cuenta asociada a este correo electrónico');
        return;
      }

      const result = await sendPasswordResetEmail(email);

      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message || 'Error al enviar el código');
      }
    } catch (err) {
      console.error('Error en requestPasswordReset:', err);
      setError('Error al enviar el código de recuperación');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verificar el código
      const isValidCode = verifyResetCode(email, code);

      if (!isValidCode) {
        setError('Código inválido o expirado');
        return;
      }

      // Simular cambio de contraseña (aquí normalmente harías una llamada a tu API)
      // Por ahora solo guardamos en localStorage para demostración
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex(u => u.email === email);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword; // En producción, esto debería estar hasheado
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Marcar código como usado
      markResetCodeAsUsed(email);

      setSuccess('Contraseña restablecida exitosamente');

      // Limpiar código después de un tiempo
      setTimeout(() => {
        clearResetCode(email);
      }, 1000);

    } catch (err) {
      console.error('Error en resetPassword:', err);
      setError('Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    loading,
    error,
    success,
    requestPasswordReset,
    resetPassword,
    clearMessages,
    isAdmin,
    isUser,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};