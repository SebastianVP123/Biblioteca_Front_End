// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="page">
      {/* Hero Section */}
      <section className="text-center mb-8">
        <h1 className="page-title">
          Bienvenido a la <span className="text-primary">Biblioteca Digital</span>
        </h1>
        <p className="page-subtitle">
          Gestiona libros, autores y préstamos de manera eficiente con nuestra plataforma moderna y profesional.
        </p>
        <div className="flex gap-4 justify-center mt-8">
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                Crear Cuenta
              </Link>
              <Link to="/login" className="btn btn-secondary btn-lg">
                Iniciar Sesión
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Ir al Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mb-8">
        <h2 className="text-center font-bold mb-8 text-gray-900" style={{fontSize: '2rem'}}>Características de Nuestra Biblioteca</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>📚</div>
              <h3 className="card-title">Catálogo Completo</h3>
              <p className="text-gray">Accede a miles de libros organizados por categorías, autores y géneros.</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>👥</div>
              <h3 className="card-title">Gestión de Autores</h3>
              <p className="text-gray">Información detallada sobre autores con biografías y obras completas.</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>📋</div>
              <h3 className="card-title">Sistema de Préstamos</h3>
              <p className="text-gray">Gestión eficiente de préstamos con recordatorios y renovaciones automáticas.</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>🔍</div>
              <h3 className="card-title">Búsqueda Avanzada</h3>
              <p className="text-gray">Encuentra libros rápidamente con filtros por título, autor, ISBN o categoría.</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>📊</div>
              <h3 className="card-title">Estadísticas</h3>
              <p className="text-gray">Dashboard con métricas de uso, libros más populares y estadísticas de préstamos.</p>
            </div>
          </div>
          <div className="card text-center">
            <div className="card-content">
              <div className="text-4xl mb-4" style={{fontSize: '3rem'}}>🔒</div>
              <h3 className="card-title">Seguridad</h3>
              <p className="text-gray">Sistema seguro con autenticación y control de acceso basado en roles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-secondary p-8">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="font-bold mb-4 text-gray-900" style={{fontSize: '2rem'}}>¿Listo para explorar nuestra biblioteca?</h2>
          <p className="text-gray-600 mb-8" style={{fontSize: '1.125rem'}}>Descubre miles de libros y comienza tu viaje literario hoy mismo.</p>
          {!user ? (
            <Link to="/register" className="btn btn-primary btn-xl">
              Crear Mi Cuenta
            </Link>
          ) : (
            <Link to="/books" className="btn btn-primary btn-xl">
              Explorar Libros
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}