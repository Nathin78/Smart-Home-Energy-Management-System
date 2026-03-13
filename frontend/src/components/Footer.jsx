import React from 'react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* Social Banner */}
      <div className="footer-social-banner">
        <div className="social-banner-content">
          <h3>Get connected with us on social networks!</h3>
          <div className="social-icons">
            <a href="#facebook" className="social-icon" title="Facebook">f</a>
            <a href="#twitter" className="social-icon" title="Twitter">𝕏</a>
            <a href="#google" className="social-icon" title="Google+">+</a>
            <a href="#linkedin" className="social-icon" title="LinkedIn">in</a>
            <a href="#instagram" className="social-icon" title="Instagram">📷</a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-section">
            <h4>SHEMS</h4>
            <p>Smart Home Energy Management System. Manage and optimize your home energy consumption efficiently with our advanced technology.</p>
          </div>

          <div className="footer-section">
            <h4>FEATURES</h4>
            <ul>
              <li><a href="#energy">Energy Tracking</a></li>
              <li><a href="#devices">Device Management</a></li>
              <li><a href="#analytics">Analytics</a></li>
              <li><a href="#automation">Automation</a></li>
              <li><a href="#reports">Reports</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>USEFUL LINKS</h4>
            <ul>
              <li><a href="#account">Your Account</a></li>
              <li><a href="#become-partner">Become a Partner</a></li>
              <li><a href="#shipping">Shipping Rates</a></li>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>CONTACT</h4>
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <span>Energy City, NY 10012, US</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">✉️</span>
              <span>support@shems.com</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">📞</span>
              <span>+ 01 234 567 88</span>
            </div>
            <div className="contact-item">
              <span className="contact-icon">🏢</span>
              <span>+ 01 234 567 89</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p>&copy; {currentYear} Copyright: <strong>SHEMS.com</strong></p>
      </div>
    </footer>
  )
}

export default Footer
