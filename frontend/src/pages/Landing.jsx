import React from 'react'
import { Link } from 'react-router-dom'
import './Landing.css'

const featureCards = [
  {
    title: 'Live Monitoring',
    description:
      'Watch energy usage update in real time so you can spot waste the moment it starts.',
  },
  {
    title: 'Device Control',
    description:
      'Keep every connected appliance in one place with a dashboard built for quick actions.',
  },
  {
    title: 'Cost Awareness',
    description:
      'Turn consumption patterns into clear cost insights that help you make better decisions.',
  },
  {
    title: 'Smart Alerts',
    description:
      'Get notified when usage spikes, devices stay active too long, or patterns look unusual.',
  },
  {
    title: 'Reports That Matter',
    description:
      'Review daily, weekly, and monthly snapshots that make it easier to plan ahead.',
  },
  {
    title: 'Private by Design',
    description:
      'Keep your household information protected with a simple, secure experience.',
  },
]

const stats = [
  { value: '24/7', label: 'Monitoring' },
  { value: '1', label: 'Unified dashboard' },
  { value: '3', label: 'Alert tiers' },
  { value: '0', label: 'Guesswork' },
]

const steps = [
  {
    step: '01',
    title: 'Connect',
    description: 'Bring your rooms, devices, and preferences into one secure workspace.',
  },
  {
    step: '02',
    title: 'Observe',
    description: 'See live consumption, trends, and device activity without jumping between screens.',
  },
  {
    step: '03',
    title: 'Optimize',
    description: 'Use practical insights to reduce waste, trim bills, and build smarter habits.',
  },
]

function Landing() {
  return (
    <div className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <span className="hero-kicker">Smart Home Energy Management</span>
          <h1>See every watt, shape better habits, and stay in control.</h1>
          <p className="hero-description">
            SHEMS gives you a calm, modern view of your home energy usage. Monitor live data,
            manage connected devices, and spot waste before it becomes a bill shock.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="button button-primary">
              Get Started
            </Link>
            <Link to="/login" className="button button-secondary">
              Log In
            </Link>
          </div>

          <div className="hero-tags" aria-label="Key benefits">
            <span>Real-time insights</span>
            <span>Clear reports</span>
            <span>Secure access</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="ambient ambient-one" />
          <div className="ambient ambient-two" />

          <div className="dashboard-card">
            <div className="dashboard-topline">
              <div>
                <p className="dashboard-label">Live usage</p>
                <h2>2.4 kW</h2>
              </div>
              <span className="live-pill">Active now</span>
            </div>

            <div className="chart-shell">
              <div className="chart-bars">
                <span style={{ height: '32%' }} />
                <span style={{ height: '56%' }} />
                <span style={{ height: '42%' }} />
                <span style={{ height: '72%' }} />
                <span style={{ height: '48%' }} />
                <span style={{ height: '82%' }} />
              </div>
              <div className="chart-caption">
                <p>Usage stays visible across the day so patterns are easy to understand.</p>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="mini-card">
                <span>Peak window</span>
                <strong>6 PM - 9 PM</strong>
              </div>
              <div className="mini-card">
                <span>Rooms tracked</span>
                <strong>08</strong>
              </div>
              <div className="mini-card">
                <span>Alerts today</span>
                <strong>03</strong>
              </div>
              <div className="mini-card">
                <span>Efficiency</span>
                <strong>91%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="content-section" id="features">
        <div className="section-heading">
          <span className="section-kicker">Why it works</span>
          <h2>Everything you need to understand and improve home energy use.</h2>
          <p>
            The landing page leads into the same dashboard experience your users will rely on
            every day, with a stronger focus on clarity and action.
          </p>
        </div>

        <div className="feature-grid">
          {featureCards.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-index">0{index + 1}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="content-section split-section">
        <div className="section-heading section-heading-left">
          <span className="section-kicker">How it flows</span>
          <h2>Designed to feel simple from the first click.</h2>
          <p>
            The experience starts with a strong home screen and moves users toward login or
            registration without friction.
          </p>
        </div>

        <div className="steps-grid">
          {steps.map((item) => (
            <article className="step-card" key={item.step}>
              <span className="step-number">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div>
          <span className="section-kicker">Ready to begin?</span>
          <h2>Start with a landing page that feels as polished as the product behind it.</h2>
        </div>
        <div className="cta-actions">
          <Link to="/register" className="button button-primary">
            Create account
          </Link>
          <Link to="/about" className="button button-secondary">
            Learn more
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Landing
