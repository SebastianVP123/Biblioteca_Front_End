// src/pages/ResetPassword.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import MessageAlert from "../components/common/MessageAlert";
import { validateEmail, validatePassword, validatePasswordMatch, validateResetCode } from "../utils/validators";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error, success, resetPassword, clearMessages } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validación en tiempo real
    const newErrors = { ...validationErrors };

    switch (name) {
      case 'email':
        const emailValidation = validateEmail(value);
        if (emailValidation.isValid) {
          delete newErrors.email;
        } else {
          newErrors.email = emailValidation.error;
        }
        break;
      case 'code':
        const codeValidation = validateResetCode(value);
        if (codeValidation.isValid) {
          delete newErrors.code;
        } else {
          newErrors.code = codeValidation.error;
        }
        break;
      case 'newPassword':
        const passwordValidation = validatePassword(value);
        if (passwordValidation.isValid) {
          delete newErrors.newPassword;
        } else {
          newErrors.newPassword = passwordValidation.error;
        }
        // Revalidar confirmación si existe
        if (formData.confirmPassword) {
          const matchValidation = validatePasswordMatch(value, formData.confirmPassword);
          if (matchValidation.isValid) {
            delete newErrors.confirmPassword;
          } else {
            newErrors.confirmPassword = matchValidation.error;
          }
        }
        break;
      case 'confirmPassword':
        const matchValidation = validatePasswordMatch(formData.newPassword, value);
        if (matchValidation.isValid) {
          delete newErrors.confirmPassword;
        } else {
          newErrors.confirmPassword = matchValidation.error;
        }
        break;
    }

    setValidationErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Validar todos los campos
    const errors = {};

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) errors.email = emailValidation.error;

    const codeValidation = validateResetCode(formData.code);
    if (!codeValidation.isValid) errors.code = codeValidation.error;

    const passwordValidation = validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) errors.newPassword = passwordValidation.error;

    const matchValidation = validatePasswordMatch(formData.newPassword, formData.confirmPassword);
    if (!matchValidation.isValid) errors.confirmPassword = matchValidation.error;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      await resetPassword(formData.email, formData.code, formData.newPassword);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      // Error ya manejado en el hook
    }
  };

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const isFormValid = formData.email && formData.code && formData.newPassword && formData.confirmPassword && !hasValidationErrors;

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">🔑 Restablecer Contraseña</h1>
        <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
          Ingresa el código que recibiste por email y tu nueva contraseña.
        </p>

        {/* Mensajes */}
        {error && <div className="auth-message auth-message-error">{error}</div>}
        {success && <div className="auth-message auth-message-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className={`auth-input ${validationErrors.email ? 'auth-input-error' : ''}`}
              placeholder="tu.email@ejemplo.com"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {validationErrors.email && (
              <div className="auth-message auth-message-error" style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.9rem' }}>
                {validationErrors.email}
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="code" className="auth-label">Código de recuperación</label>
            <input
              type="text"
              id="code"
              name="code"
              className={`auth-input ${validationErrors.code ? 'auth-input-error' : ''}`}
              placeholder="Ingresa el código de 6 dígitos"
              required
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
              maxLength="6"
            />
            {validationErrors.code && (
              <div className="auth-message auth-message-error" style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.9rem' }}>
                {validationErrors.code}
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="newPassword" className="auth-label">Nueva contraseña</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className={`auth-input ${validationErrors.newPassword ? 'auth-input-error' : ''}`}
              placeholder="Mínimo 6 caracteres"
              required
              value={formData.newPassword}
              onChange={handleChange}
              disabled={loading}
              minLength="6"
            />
            {validationErrors.newPassword && (
              <div className="auth-message auth-message-error" style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.9rem' }}>
                {validationErrors.newPassword}
              </div>
            )}
          </div>

          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-label">Confirmar nueva contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className={`auth-input ${validationErrors.confirmPassword ? 'auth-input-error' : ''}`}
              placeholder="Repite la contraseña"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              minLength="6"
            />
            {validationErrors.confirmPassword && (
              <div className="auth-message auth-message-error" style={{ marginTop: 'var(--spacing-xs)', fontSize: '0.9rem' }}>
                {validationErrors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !isFormValid}
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Restableciendo...
              </>
            ) : (
              "Restablecer contraseña"
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿No tienes un código? <Link to="/forgot-password" className="auth-link">Solicitar código</Link>
          </p>
          <p>
            <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;