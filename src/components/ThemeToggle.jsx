import React, { useState, useEffect } from 'react';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  // Cargar preferencia del usuario al montar el componente
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark-theme');
    }
  }, []);

  // Función para alternar el tema
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="theme-toggle">
      <span className="theme-toggle-label">
        {isDark ? 'Modo Oscuro' : 'Modo Claro'}
      </span>
      <button
        className="theme-toggle-button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        <span className="theme-toggle-icon sun">☀️</span>
        <div className={`theme-toggle-slider ${isDark ? 'active' : ''}`}>
          {isDark ? '🌙' : '☀️'}
        </div>
        <span className="theme-toggle-icon moon">🌙</span>
      </button>
    </div>
  );
};

export default ThemeToggle;