import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AccountSettings.css'

export default function AccountSettings() {
  const [newEmail, setNewEmail] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailMessage, setEmailMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')

  const handleEmailChange = async (e) => {
    e.preventDefault()
    setEmailError('')
    setEmailMessage('')
    setEmailLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error
      setEmailMessage(
        'Confirmation links sent to both your old and new email. Click the link in the new email to complete the change.'
      )
      setNewEmail('')
    } catch (err) {
      setEmailError(err.message || 'Could not update email.')
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.')
      return
    }

    setPasswordLoading(true)
    try {
      // Re-verify identity with current password before changing
      const { data: { user } } = await supabase.auth.getUser()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })
      if (signInError) throw new Error('Current password is incorrect.')

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordMessage('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.message || 'Could not update password.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="acct-page">
      <div className="wrap acct-wrap">
        <span className="section-eyebrow mono">ACCOUNT</span>
        <h1>Account settings</h1>
        <p className="assess-lead">Update your email or password below.</p>

        <section className="acct-section">
          <h2 className="acct-section-title">Change email</h2>
          <form onSubmit={handleEmailChange} className="acct-form">
            <label className="auth-label">
              New email
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                placeholder="new@example.com"
                className="auth-input"
              />
            </label>
            {emailError && <p className="auth-error">{emailError}</p>}
            {emailMessage && <p className="auth-message">{emailMessage}</p>}
            <button type="submit" className="btn-primary" disabled={emailLoading}>
              {emailLoading ? 'Updating…' : 'Update email'}
            </button>
          </form>
        </section>

        <section className="acct-section">
          <h2 className="acct-section-title">Change password</h2>
          <form onSubmit={handlePasswordChange} className="acct-form">
            <label className="auth-label">
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="auth-input"
              />
            </label>
            <label className="auth-label">
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="auth-input"
              />
            </label>
            <label className="auth-label">
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="••••••••"
                className="auth-input"
              />
            </label>
            {passwordError && <p className="auth-error">{passwordError}</p>}
            {passwordMessage && <p className="auth-message">{passwordMessage}</p>}
            <button type="submit" className="btn-primary" disabled={passwordLoading}>
              {passwordLoading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        <Link to="/" className="btn-ghost">
          ← Back to home
        </Link>
      </div>
    </div>
  )
}