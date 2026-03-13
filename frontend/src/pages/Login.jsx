import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import './Auth.css'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotMessage, setForgotMessage] = useState('')
  const [unverifiedEmail, setUnverifiedEmail] = useState('')
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false)
  const [verificationOTP, setVerificationOTP] = useState('')
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [resendVerificationLoading, setResendVerificationLoading] = useState(false)
  const [showResetOTPForm, setShowResetOTPForm] = useState(false)
  const [resetOTP, setResetOTP] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetOTPLoading, setResetOTPLoading] = useState(false)

  const validateLogin = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    }

    return newErrors
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const newErrors = validateLogin()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.login({
        email: email.trim().toLowerCase(),
        password,
      })

      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onLogin()
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Login error:', error)
      const status = error.response?.status
      const errorMessage = error.response?.data?.message
        || (status === 500
          ? 'Server error (500). Check the backend terminal/logs. If the backend is not running, start it on http://localhost:8080/api and restart the frontend dev server.'
          : ((error.code === 'ECONNABORTED' || error.message === 'Network Error')
            ? 'Network error: backend not reachable. Ensure backend is running on http://localhost:8080 and restart the frontend dev server.'
            : 'Login failed. Please check your credentials.'))
      
      // Check if the error is about email not verified
      if (errorMessage.includes('Email not verified')) {
        setUnverifiedEmail(email.trim().toLowerCase())
        setShowEmailVerificationMessage(true)
        setVerificationOTP('')
        setVerificationError('')
        setVerificationMessage('')
      } else {
        setErrors({
          submit: errorMessage
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!forgotEmail.trim()) {
      setErrors({ forgotEmail: 'Email is required' })
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.forgotPassword(forgotEmail)
      setForgotMessage(response?.data?.message || 'OTP has been sent to your email.')
      setShowResetOTPForm(true)
      setErrors({})
    } catch (error) {
      console.error('Forgot password error:', error)
      setErrors({
        forgotEmail: error.response?.data?.message || 'Failed to send OTP.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyResetOTP = async (e) => {
    e.preventDefault()

    if (!resetOTP.trim() || resetOTP.length !== 6) {
      setErrors({ resetOTP: 'Please enter a valid 6-digit OTP' })
      return
    }

    if (!newPassword.trim()) {
      setErrors({ newPassword: 'New password is required' })
      return
    }

    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' })
      return
    }

    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: 'Passwords do not match' })
      return
    }

    setResetOTPLoading(true)
    try {
      await authAPI.verifyResetOTP(resetOTP, newPassword)
      setForgotMessage('Password has been reset successfully! Redirecting to login...')
      setTimeout(() => {
        setShowForgotPassword(false)
        setShowResetOTPForm(false)
        setForgotEmail('')
        setResetOTP('')
        setNewPassword('')
        setConfirmNewPassword('')
        setForgotMessage('')
        setErrors({})
      }, 2000)
    } catch (error) {
      console.error('Reset OTP verification error:', error)
      setErrors({
        submit: error.response?.data?.message || 'Failed to reset password.'
      })
    } finally {
      setResetOTPLoading(false)
    }
  }

  const handleResendVerificationOTP = async () => {
    const targetEmail = unverifiedEmail?.trim().toLowerCase()
    if (!targetEmail) return

    setResendVerificationLoading(true)
    setVerificationError('')
    setVerificationMessage('')
    try {
      await authAPI.sendOTP(targetEmail)
      setVerificationMessage('OTP resent. Please check your inbox.')
    } catch (error) {
      console.error('Resend OTP error:', error)
      setVerificationError(error.response?.data?.message || 'Failed to resend OTP. Please try again.')
    } finally {
      setResendVerificationLoading(false)
    }
  }

  const handleVerifyEmailOTP = async (e) => {
    e.preventDefault()

    if (!verificationOTP.trim() || verificationOTP.trim().length !== 6) {
      setVerificationError('Please enter a valid 6-digit OTP')
      return
    }

    setVerificationLoading(true)
    setVerificationError('')
    setVerificationMessage('')
    try {
      await authAPI.verifyEmail(verificationOTP.trim())
      setVerificationMessage('Email verified successfully. You can log in now.')
      setTimeout(() => {
        setShowEmailVerificationMessage(false)
        setUnverifiedEmail('')
        setVerificationOTP('')
        setVerificationError('')
        setVerificationMessage('')
      }, 900)
    } catch (error) {
      console.error('Verify email OTP error:', error)
      setVerificationError(error.response?.data?.message || 'Invalid OTP. Please try again.')
    } finally {
      setVerificationLoading(false)
    }
  }

  return (
    <div className="auth-container">
      {/* Left Panel - Welcome Section */}
      <div className="auth-panel-left">
        <div className="welcome-content">
          <div className="welcome-header">
            <h2>Welcome Back! 🏠</h2>
            <p>Manage your home energy smartly</p>
          </div>
          
          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <h3>Monitor Energy</h3>
              <p>Track real-time consumption</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <h3>Save Money</h3>
              <p>Reduce your energy bills</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌱</span>
              <h3>Go Green</h3>
              <p>Environmental awareness</p>
            </div>
          </div>
          
          <div className="welcome-image">
            <div className="image-placeholder">
              <span className="large-icon">🔌</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="auth-card">
        {showEmailVerificationMessage ? (
          <>
            <div className="auth-header">
              <h1>Email Not Verified</h1>
              <p>Verify your email to continue</p>
            </div>

            <div className="verification-message">
              <div className="message-icon">⚠️</div>
              <p>Your email has not been verified yet.</p>
              <p className="email-display"><strong>{unverifiedEmail}</strong></p>
              <p>Please check your email for the 6-digit OTP code we sent during registration.</p>
              <p className="info-text">The OTP will expire in 10 minutes.</p>
            </div>

            <form onSubmit={handleVerifyEmailOTP} className="auth-form">
              <div className="form-group">
                <label htmlFor="verificationOTP">Enter OTP</label>
                <input
                  type="text"
                  id="verificationOTP"
                  value={verificationOTP}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    if (value.length <= 6) {
                      setVerificationOTP(value)
                      if (verificationError) setVerificationError('')
                    }
                  }}
                  placeholder="000000"
                  maxLength="6"
                  disabled={verificationLoading || resendVerificationLoading}
                  inputMode="numeric"
                />
                {verificationError && <span className="error-text">{verificationError}</span>}
              </div>

              {verificationMessage && (
                <div className="success-message">{verificationMessage}</div>
              )}

              <button type="submit" className="submit-btn" disabled={verificationLoading || resendVerificationLoading}>
                {verificationLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                className="submit-btn"
                onClick={handleResendVerificationOTP}
                disabled={verificationLoading || resendVerificationLoading}
                style={{ marginTop: 12 }}
              >
                {resendVerificationLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            </form>

            <div className="auth-footer">
              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setShowEmailVerificationMessage(false)
                  setUnverifiedEmail('')
                  setVerificationOTP('')
                  setVerificationError('')
                  setVerificationMessage('')
                  setEmail('')
                  setPassword('')
                  setErrors({})
                }}
              >
                Back to Login
              </button>
              <p><Link to="/register">Need to register again?</Link></p>
            </div>
          </>
        ) : !showForgotPassword ? (
          <>
            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Smart Home Energy Management System</p>
            </div>

            {errors.submit && (
              <div className="error-message">{errors.submit}</div>
            )}

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }))
                  }}
                  placeholder="Enter your email"
                  disabled={loading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }))
                    }}
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

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="auth-links">
              <button 
                type="button" 
                className="forgot-password-btn"
                onClick={() => setShowForgotPassword(true)}
              >
                Forgot Password?
              </button>
            </div>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Create one here</Link></p>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1>Reset Password</h1>
              <p>Enter your email to receive OTP</p>
            </div>

            {forgotMessage && (
              <div className="success-message">{forgotMessage}</div>
            )}

            {!showResetOTPForm ? (
              <form onSubmit={handleForgotPassword} className="auth-form">
                <div className="form-group">
                  <label htmlFor="forgotEmail">Email Address</label>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value)
                      if (errors.forgotEmail) setErrors(prev => ({ ...prev, forgotEmail: '' }))
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                  {errors.forgotEmail && <span className="error-text">{errors.forgotEmail}</span>}
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyResetOTP} className="auth-form">
                <div className="form-group">
                  <label htmlFor="resetOTP">Enter OTP</label>
                  <input
                    type="text"
                    id="resetOTP"
                    value={resetOTP}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      if (value.length <= 6) {
                        setResetOTP(value)
                        if (errors.resetOTP) setErrors(prev => ({ ...prev, resetOTP: '' }))
                      }
                    }}
                    placeholder="000000"
                    maxLength="6"
                    disabled={resetOTPLoading}
                    inputMode="numeric"
                  />
                  {errors.resetOTP && <span className="error-text">{errors.resetOTP}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }))
                      }}
                      placeholder="Enter new password"
                      disabled={resetOTPLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      disabled={resetOTPLoading}
                    >
                      {showNewPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                  {errors.newPassword && <span className="error-text">{errors.newPassword}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmNewPassword">Confirm Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmNewPassword ? 'text' : 'password'}
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value)
                        if (errors.confirmNewPassword) setErrors(prev => ({ ...prev, confirmNewPassword: '' }))
                      }}
                      placeholder="Confirm new password"
                      disabled={resetOTPLoading}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      disabled={resetOTPLoading}
                    >
                      {showConfirmNewPassword ? '👁️‍🗨️' : '👁️'}
                    </button>
                  </div>
                  {errors.confirmNewPassword && <span className="error-text">{errors.confirmNewPassword}</span>}
                </div>

                {errors.submit && <div className="error-message">{errors.submit}</div>}

                <button type="submit" className="submit-btn" disabled={resetOTPLoading}>
                  {resetOTPLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <button 
                type="button" 
                className="back-btn"
                onClick={() => {
                  setShowForgotPassword(false)
                  setShowResetOTPForm(false)
                  setForgotEmail('')
                  setResetOTP('')
                  setNewPassword('')
                  setConfirmNewPassword('')
                  setForgotMessage('')
                  setErrors({})
                }}
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Login
