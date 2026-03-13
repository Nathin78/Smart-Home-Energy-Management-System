import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const isAuthenticated = !!localStorage.getItem('authToken')

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">SHEMS</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
            About
          </Link>
          <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`}>
            Contact
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Login
              </Link>
              <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
                Register
              </Link>
            </>
          )}
        </nav>

        <div className="header-right">
          {isAuthenticated && user ? (
            <div className="user-section">
              <span className="user-name">{user.firstName} {user.lastName}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Header
