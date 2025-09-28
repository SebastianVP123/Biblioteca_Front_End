import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>🏛️ Biblioteca Digital</h3>
                        <p>
                            Gestiona tus libros, autores y préstamos de manera eficiente con nuestra plataforma moderna y profesional. Tecnología avanzada para una experiencia excepcional.
                        </p>
                        <div className="footer-social">
                            <a href="#" title="Facebook">📘</a>
                            <a href="#" title="Twitter">🐦</a>
                            <a href="#" title="Instagram">📷</a>
                            <a href="#" title="LinkedIn">💼</a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h3>🔗 Enlaces Rápidos</h3>
                        <ul className="footer-links">
                            <li><a href="/">🏠 Inicio</a></li>
                            <li><a href="/books">📚 Libros</a></li>
                            <li><a href="/authors">✍️ Autores</a></li>
                            <li><a href="/borrow">📖 Préstamos</a></li>
                            <li><a href="/dashboard">📊 Dashboard</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h3>📞 Contacto & Soporte</h3>
                        <p>
                            Para soporte técnico, consultas o sugerencias, contáctanos a través de nuestro sistema de tickets o redes sociales.
                        </p>
                        <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                            📧 soporte@biblioteca.com<br/>
                            📱 +57 300 123 4567
                        </p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Todos los derechos reservados. Desarrollado con ❤️ por Sebastian Valencia Perez.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;