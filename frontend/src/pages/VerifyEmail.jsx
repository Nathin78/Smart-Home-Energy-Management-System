import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authAPI } from '../services/api'
import './Auth.css'

function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const token = searchParams.get('otp') || searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setError('No verification code provided')
      setLoading(false)
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(token)
        setVerified(true)
        setLoading(false)
      } catch (err) {
        console.error('Verification error:', err)
        setError(err.response?.data?.message || 'Email verification failed. Please try again.')
        setLoading(false)
      }
    }

    // Add a small delay to avoid too quick verification
    const timer = setTimeout(() => {
      verifyEmail()
    }, 1000)

    return () => clearTimeout(timer)
  }, [token])

  return (
    <div className="auth-container">
      <div className="auth-card">
        {loading ? (
          <>
            <div className="auth-header">
              <h1>Verifying Email</h1>
              <p>Please wait...</p>
            </div>
            <div className="verification-loading">
              <div className="spinner"></div>
              <p>Verifying your email address...</p>
            </div>
          </>
        ) : verified ? (
          <>
            <div className="auth-header">
              <h1>Email Verified!</h1>
              <p>Welcome to SHEMS</p>
            </div>
            <div className="verification-message success">
              <div className="message-icon">✓</div>
              <p>Your email has been successfully verified.</p>
              <p>You can now log in to your account and start managing your smart home energy.</p>
            </div>
            <div className="auth-footer">
              <button 
                type="button" 
                className="submit-btn"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h1>Verification Failed</h1>
              <p>Unable to verify email</p>
            </div>
            <div className="verification-message error">
              <div className="message-icon">✕</div>
              <p>{error}</p>
              <p>Please try registering again or contact support.</p>
            </div>
            <div className="auth-footer">
              <Link to="/register" className="submit-btn">
                Back to Register
              </Link>
              <p><Link to="/login">Back to Login</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail
