import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Login.css'

export default function Login({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'reset'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuthSuccess?.()
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        setMessage('Check your email to confirm your account.')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        if (error) throw error
        setMessage('Check your email for a password reset link.')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-logo" />
          <span className="auth-title">Soul Search</span>
        </div>

        <h1 className="auth-heading">
          {mode === 'login' && 'Welcome back'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'reset' && 'Reset your password'}
        </h1>
        <p className="auth-subheading">
          {mode === 'login' && 'Log in to continue your triad.'}
          {mode === 'signup' &&
            'Sign up to start tracking mental, physical, and emotional wellbeing.'}
          {mode === 'reset' &&
            "Enter your email and we'll send you a link to reset your password."}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <label className="auth-label">
              Full name
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Emmanuel"
                className="auth-input"
              />
            </label>
          )}

          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="auth-input"
            />
          </label>

          {mode !== 'reset' && (
            <label className="auth-label">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                className="auth-input"
              />
            </label>
          )}

          {mode === 'login' && (
            <button
              type="button"
              className="auth-link auth-forgot"
              onClick={() => {
                setMode('reset')
                setError('')
                setMessage('')
              }}
            >
              Forgot password?
            </button>
          )}

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? 'Please wait…'
              : mode === 'login'
              ? 'Log in'
              : mode === 'signup'
              ? 'Sign up'
              : 'Send reset link'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' && (
            <>
              Don't have an account?{' '}
              <button className="auth-link" onClick={() => setMode('signup')}>
                Sign up
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button className="auth-link" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
          {mode === 'reset' && (
            <>
              Remembered it?{' '}
              <button className="auth-link" onClick={() => setMode('login')}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}