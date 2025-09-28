// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PrivateRoute from "./routes/PrivateRoute";
import AdminRoute from "./routes/AdminRoute";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import User from "./pages/user";
import Authors from "./pages/authors";
import Books from "./pages/books";
import Borrow from "./pages/borrow";
import Returns from "./pages/returns";
import Footer from "./components/Footer";
import "./App.css";


export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/user" element={<PrivateRoute><AdminRoute><User /></AdminRoute></PrivateRoute>} />
        <Route path="/authors" element={<PrivateRoute><Authors /></PrivateRoute>} />
        <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
        <Route path="/borrow" element={<PrivateRoute><Borrow /></PrivateRoute>} />
        <Route path="/returns" element={<PrivateRoute><Returns /></PrivateRoute>} />
      </Routes>
      </main>
      <Footer />
    </div>
  );
}