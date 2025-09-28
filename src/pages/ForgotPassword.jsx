// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";
import MessageAlert from "../components/common/MessageAlert";
import { validateEmail } from "../utils/validators";
import { emailExists } from "../utils/userHelpers";
import EmailJSConfig from "../components/EmailJSConfig";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [isEmailJSConfigured, setIsEmailJSConfigured] = useState(false);
  const { loading, error, success, requestPasswordReset, clearMessages } = useAuth();

  // Verificar si EmailJS está configurado
  React.useEffect(() => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const configured = serviceId && templateId && publicKey &&
                      serviceId !== 'tu-service-id' &&
                      templateId !== 'tu-template-id' &&
                      publicKey !== 'tu-public-key';

    setIsEmailJSConfigured(configured);
  }, []);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);

    // Limpiar errores previos
    setEmailError("");
    clearMessages();

    // Validar email en tiempo real
    if (newEmail && !validateEmail(newEmail).isValid) {
      setEmailError(validateEmail(newEmail).message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar mensajes previos
    setEmailError("");
    clearMessages();

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.message);
      return;
    }

    // Verificar si el email existe antes de proceder
    if (!emailExists(email)) {
      setEmailError("No existe una cuenta asociada a este correo electrónico. ¿Necesitas registrarte?");
      return;
    }

    try {
      await requestPasswordReset(email);
    } catch (err) {
      // Error ya manejado en el hook
      console.error('Error en recuperación de contraseña:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">🔐 Recuperar Contraseña</h1>
        <p style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
          Ingresa tu correo electrónico y te enviaremos un código para restablecer tu contraseña.
        </p>

        {!isEmailJSConfigured && (
          <div className="auth-message auth-message-error" style={{ marginBottom: 'var(--spacing-md)' }}>
            <span>⚠️</span>
            <span style={{ marginLeft: 'var(--spacing-xs)' }}>
              EmailJS no está configurado. Se usará modo simulación.
            </span>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              style={{
                marginLeft: 'var(--spacing-sm)',
                padding: '4px 8px',
                fontSize: '0.8rem',
                background: 'transparent',
                border: '1px solid currentColor',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showConfig ? 'Ocultar' : 'Configurar'}
            </button>
          </div>
        )}

        {showConfig && (
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <EmailJSConfig
              onConfigComplete={(configured) => {
                setIsEmailJSConfigured(configured);
                if (configured) {
                  setShowConfig(false);
                }
              }}
            />
          </div>
        )}

        {/* Mensajes */}
        {error && <div className="auth-message auth-message-error">{error}</div>}
        {success && <div className="auth-message auth-message-success">{success}</div>}
        {emailError && <div className="auth-message auth-message-error">{emailError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              className="auth-input"
              placeholder="tu.email@ejemplo.com"
              required
              value={email}
              onChange={handleEmailChange}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || !email || emailError}
          >
            {loading ? (
              <>
                <LoadingSpinner small /> Enviando...
              </>
            ) : (
              "Enviar Código de Recuperación"
            )}
          </button>
        </form>

        <div className="auth-links">
          <p>
            ¿Ya tienes un código? <Link to="/reset-password" className="auth-link">Restablecer contraseña</Link>
          </p>
          <p>
            <Link to="/login" className="auth-link">Volver al inicio de sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;