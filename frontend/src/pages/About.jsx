import React from 'react'
import './About.css'

function About() {
  return (
    <div className="about">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About SHEMS</h1>
          <p>Smart Home Energy Management System</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-content">
            <h2>Our Mission</h2>
            <p>
              At SHEMS, our mission is to empower homeowners to take control of their energy consumption. 
              We believe that by providing real-time insights and intelligent analytics, people can make informed 
              decisions about their energy usage, save money, and contribute to a sustainable future.
            </p>
            <p>
              We are committed to delivering innovative technology that is accessible, user-friendly, and effective 
              in helping our users reduce their carbon footprint while optimizing their energy costs.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section alternate">
        <div className="about-container">
          <div className="about-content">
            <h2>Our Vision</h2>
            <p>
              We envision a world where every home is equipped with smart energy management systems that enable 
              efficient, sustainable, and cost-effective energy consumption. Our goal is to become the leading 
              provider of home energy management solutions globally.
            </p>
            <p>
              Through continuous innovation and dedication to our users, we aim to reduce global energy 
              consumption and contribute to environmental conservation.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section">
        <div className="about-container">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">💡</div>
              <h3>Innovation</h3>
              <p>We constantly innovate to provide cutting-edge solutions for energy management.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌍</div>
              <h3>Sustainability</h3>
              <p>Environmental responsibility is at the core of everything we do.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">👥</div>
              <h3>Customer Focus</h3>
              <p>Our customers' satisfaction and success are our highest priorities.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🔒</div>
              <h3>Security</h3>
              <p>We prioritize the security and privacy of our users' data.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📊</div>
              <h3>Transparency</h3>
              <p>We believe in honest communication and transparent operations.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Excellence</h3>
              <p>We strive for excellence in all aspects of our service delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section alternate">
        <div className="about-container">
          <h2>Our Team</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#666' }}>
            SHEMS is built by a passionate team of engineers, data scientists, and energy experts 
            dedicated to revolutionizing how homes manage energy consumption.
          </p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍💼</div>
              <h3>Founder & CEO</h3>
              <p>Leading the vision with 15+ years in energy technology</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <h3>CTO & Co-Founder</h3>
              <p>Driving technical innovation in smart home solutions</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👨‍🔬</div>
              <h3>Lead Data Scientist</h3>
              <p>Developing advanced analytics and ML models</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍⚕️</div>
              <h3>VP Product</h3>
              <p>Creating exceptional user experiences</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="about-container">
          <div className="stats-grid">
            <div className="stat-box">
              <h3>10,000+</h3>
              <p>Active Users</p>
            </div>
            <div className="stat-box">
              <h3>50M+</h3>
              <p>kWh Saved</p>
            </div>
            <div className="stat-box">
              <h3>$5M+</h3>
              <p>Savings Generated</p>
            </div>
            <div className="stat-box">
              <h3>25K+</h3>
              <p>Tons CO2 Reduced</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
