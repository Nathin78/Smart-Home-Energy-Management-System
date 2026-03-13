import React, { useState } from 'react'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      setLoading(false)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
      }, 5000)
    }, 1000)
  }

  return (
    <div className="contact">
      {/* Contact Hero */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you. Get in touch with us today!</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Get In Touch</h2>
              <p>Have questions? We're here to help. Contact us through any of these methods:</p>

              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-details">
                    <h3>Address</h3>
                    <p>17,dubai,cross street<br />Dubai</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div className="info-details">
                    <h3>Phone</h3>
                    <p>+91 9876543210<br />Monday - Friday 9AM - 6PM EST</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">✉️</div>
                  <div className="info-details">
                    <h3>Email</h3>
                    <p>smarthomeenergymanagement1@gmail.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">💬</div>
                  <div className="info-details">
                    <h3>Live Chat</h3>
                    <p>Available 24/7<br />Click the chat icon on any page</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="#facebook" className="social-link" title="Facebook">f</a>
                  <a href="#twitter" className="social-link" title="Twitter">𝕏</a>
                  <a href="#linkedin" className="social-link" title="LinkedIn">in</a>
                  <a href="#instagram" className="social-link" title="Instagram">📷</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-wrapper">
              <h2>Send us a Message</h2>

              {submitted && (
                <div className="success-message">
                  ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="billing">Billing Inquiry</option>
                    <option value="partnership">Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="6"
                    required
                    disabled={loading}
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="contact-faq">
        <div className="contact-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How quickly will I receive a response?</h3>
              <p>We typically respond to all inquiries within 24 hours during business days.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer technical support?</h3>
              <p>Yes! Our technical support team is available 24/7 through email, phone, and live chat.</p>
            </div>
            <div className="faq-item">
              <h3>Can I schedule a demo?</h3>
              <p>Absolutely! Contact us to schedule a personalized demo of SHEMS with our team.</p>
            </div>
            <div className="faq-item">
              <h3>Do you have partnership opportunities?</h3>
              <p>Yes, we're always looking for partners. Please use the "Partnership" subject in the form.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
