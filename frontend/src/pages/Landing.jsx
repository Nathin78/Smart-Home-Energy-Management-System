import React from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

function Landing() {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to SHEMS</h1>
            <p className="subtitle">Smart Home Energy Management System</p>
            <p className="description">
              Take control of your home energy consumption. Monitor, analyze, and optimize your energy usage in real-time with our intelligent smart home system.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Sign Up</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="icon-placeholder">⚡</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Why Choose SHEMS?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Real-time Monitoring</h3>
            <p>Track your energy consumption in real-time with detailed analytics and insights.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔌</div>
            <h3>Device Management</h3>
            <p>Connect and manage all your smart home devices from a single dashboard.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Save Money</h3>
            <p>Reduce your energy bills by understanding and optimizing your consumption patterns.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Go Green</h3>
            <p>Track your carbon footprint and contribute to a sustainable environment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics & Reports</h3>
            <p>Get detailed reports and predictions to make informed energy decisions.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and protected with enterprise-grade security.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <h3>10,000+</h3>
            <p>Active Users</p>
          </div>
          <div className="stat-item">
            <h3>50M+</h3>
            <p>kWh Saved</p>
          </div>
          <div className="stat-item">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
          <div className="stat-item">
            <h3>24/7</h3>
            <p>Support</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Optimize Your Energy?</h2>
        <p>Join thousands of users already saving energy and money with SHEMS</p>
        <Link to="/register" className="btn btn-large">Get Started Now</Link>
      </section>
    </div>
  )
}

export default Landing
