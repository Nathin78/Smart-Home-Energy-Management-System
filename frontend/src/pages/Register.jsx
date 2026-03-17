import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import './Auth.css'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    primaryInterest: '',
    password: '',
    confirmPassword: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Email verification stages
  const [emailVerificationStep, setEmailVerificationStep] = useState('email') // 'email' | 'otp' | 'form' | 'final'
  const [verificationEmail, setVerificationEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpResendCount, setOtpResendCount] = useState(0)
  const [resendDisabled, setResendDisabled] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    let filteredValue = value

    // Only allow alphabets and spaces for name fields
    if (name === 'firstName' || name === 'lastName') {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, '')
    }

    // Only allow numbers for mobile number
    if (name === 'mobileNumber') {
      filteredValue = value.replace(/[^0-9]/g, '')
    }

    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }))
    
    // Real-time password confirmation validation
    if (name === 'confirmPassword' && filteredValue && formData.password) {
      if (filteredValue !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }))
      }
    } else if (name === 'password' && formData.confirmPassword) {
      // Also validate when password field changes if confirm password is already filled
      if (filteredValue !== formData.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }))
      }
    } else {
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }))
      }
    }
  }

  const handleEmailChange = (e) => {
    const email = e.target.value
    setVerificationEmail(email)
    if (otpError) setOtpError('')
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
    setOtp(value)
    if (otpError) setOtpError('')
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    
    if (!verificationEmail.trim()) {
      setOtpError('Please enter your email address')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(verificationEmail)) {
      setOtpError('Please enter a valid email address')
      return
    }

    setOtpLoading(true)
    setOtpError('')
    try {
      const normalizedEmail = verificationEmail.trim().toLowerCase()
      const response = await authAPI.sendOTP(normalizedEmail)
      setOtpSent(true)
      setEmailVerificationStep('otp')
      setSuccessMessage(response?.data?.message || 'OTP sent to your email! Check your inbox.')
      
      // Auto-disable resend for 60 seconds
      setResendDisabled(true)
      setTimeout(() => setResendDisabled(false), 60000)
    } catch (error) {
      console.error('Send OTP error:', error)
      const message = error.response?.data?.message
      const status = error.response?.status
      if (!message && (error.code === 'ECONNABORTED' || error.message === 'Network Error')) {
        setOtpError('Network error: backend not reachable. Ensure backend is running on http://localhost:8080 and restart the frontend dev server.')
      } else if (!message && status === 500) {
        setOtpError('Server error (500). Check the backend terminal/logs. If the backend is not running, start it on http://localhost:8080/api and restart the frontend dev server.')
      } else {
        setOtpError(message || 'Failed to send OTP. Please try again.')
      }
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    console.log('handleOtpSubmit called, OTP:', otp, 'Length:', otp.length)
    
    if (!otp || otp.length !== 6) {
      console.log('OTP validation failed')
      setOtpError('Please enter a valid 6-digit OTP')
      return
    }

    setOtpLoading(true)
    setOtpError('')
    try {
      console.log('Calling verifyEmail API with OTP:', otp)
      const response = await authAPI.verifyEmail(otp)
      console.log('OTP verification successful:', response)
      setEmailVerificationStep('form')
      setFormData(prev => ({
        ...prev,
        email: verificationEmail.trim().toLowerCase()
      }))
      setSuccessMessage('Email verified! Now complete your registration.')
      setOtp('')
    } catch (error) {
      console.error('OTP verification error:', error)
      console.error('Error response:', error.response?.data)
      setOtpError(error.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required'
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number'
    }

    if (!formData.primaryInterest) {
      newErrors.primaryInterest = 'Please select your primary interest'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Final check: only accept if passwords are exactly the same
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password and confirm password must be identical'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.trim().toLowerCase(),
        mobileNumber: formData.mobileNumber,
        primaryInterest: formData.primaryInterest,
        password: formData.password,
      })

      setEmailVerificationStep('final')
      setSuccessMessage('Registration successful! Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      console.error('Registration error:', error)
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Left Panel - Welcome Section */}
      <div className="auth-panel-left">
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Join Us Today! 🌟</h2>
            <p>Start managing your energy smartly</p>
          </div>
          
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3>Real-time Monitoring</h3>
              <p>Track your energy usage instantly</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💡</span>
              <h3>Smart Insights</h3>
              <p>Get personalized recommendations</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <h3>Achieve Goals</h3>
              <p>Meet your energy targets</p>
            </div>
          </div>
          
          <div className="welcome-image">
            <div className="image-placeholder">
              <span className="large-icon">⚙️</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Registration Form */}
      <div className="auth-card">
        
        {/* Step 1: Email Entry */}
        {emailVerificationStep === 'email' && (
          <>
            <div className="auth-header">
              <h1>Create Account</h1>
              <p>Enter your email to get started</p>
            </div>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            {otpError && (
              <div className="error-message">{otpError}</div>
            )}

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={verificationEmail}
                  onChange={handleEmailChange}
                  placeholder="Enter your email"
                  disabled={otpLoading}
                  autoFocus
                />
              </div>

              <button type="submit" className="submit-btn" disabled={otpLoading}>
                {otpLoading ? 'Sending OTP...' : 'Get Code'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </>
        )}

        {/* Step 2: OTP Verification */}
        {emailVerificationStep === 'otp' && (
          <>
            <div className="auth-header">
              <h1>Verify Your Email</h1>
              <p>Enter the OTP sent to your email</p>
            </div>

            <div className="verification-message">
              <div className="message-icon">📧</div>
              <p>We've sent a 6-digit OTP to:</p>
              <p className="email-display"><strong>{verificationEmail}</strong></p>
              <p>The OTP will expire in 10 minutes.</p>
            </div>

            {otpError && (
              <div className="error-message">{otpError}</div>
            )}

            <form onSubmit={handleOtpSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="otp">Enter OTP *</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  maxLength="6"
                  disabled={otpLoading}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                />
                <p className="info-text">Enter the 6-digit code from your verification email</p>
              </div>

              <button type="submit" className="submit-btn" disabled={otpLoading || otp.length !== 6}>
                {otpLoading ? 'Verifying OTP...' : 'Verify Code'}
              </button>
            </form>

            <div className="auth-footer">
              <p>Didn't receive code? <button 
                type="button" 
                className="link-btn"
                onClick={() => {
                  setEmailVerificationStep('email')
                  setOtp('')
                  setOtpError('')
                  setOtpSent(false)
                }}
                disabled={resendDisabled || otpLoading}
              >
                {resendDisabled ? 'Resend in 60s' : 'Resend OTP'}
              </button></p>
            </div>
          </>
        )}

        {/* Step 3: Complete Registration Form */}
        {emailVerificationStep === 'form' && (
          <>
            <div className="auth-header">
              <h1>Complete Your Registration</h1>
              <p>Fill in your information to finish signup</p>
            </div>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Letters only (A-Z, a-z)"
                maxLength="50"
                disabled={loading}
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Letters only (A-Z, a-z)"
                maxLength="50"
                disabled={loading}
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              disabled={true}
              className="readonly-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number *</label>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleInputChange}
              placeholder="Numbers only (10 digits)"
              maxLength="10"
              disabled={loading}
            />
            {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="primaryInterest">Primary Interest *</label>
            <select
              id="primaryInterest"
              name="primaryInterest"
              value={formData.primaryInterest}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="">Select your primary interest</option>
              <option value="energy-savings">Energy Savings</option>
              <option value="environmental-impact">Environmental Impact</option>
              <option value="cost-reduction">Cost Reduction</option>
              <option value="home-automation">Home Automation</option>
              <option value="solar-integration">Solar Integration</option>
            </select>
            {errors.primaryInterest && <span className="error-text">{errors.primaryInterest}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login here</Link></p>
            </div>
          </>
        )}

        {/* Step 4: Success */}
        {emailVerificationStep === 'final' && (
          <>
            <div className="auth-header">
              <h1>Registration Complete! ✓</h1>
              <p>Redirecting to login...</p>
            </div>

            {successMessage && (
              <div className="success-message">{successMessage}</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Register
