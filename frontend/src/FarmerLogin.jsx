import { useState } from 'react'

function FarmerLogin({ onLogin, onSignup, onBack }) {
  const [email, setEmail] = useState('sai@gmail.com')
  const [password, setPassword] = useState('FarmAI@123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.')
      return
    }

    const farmerData = {
      message: 'Login successful',
      farmer_id: 3,
      name: 'sai',
      email: email.trim(),
    }

    onLogin(farmerData)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          type="button"
          className="auth-back"
          onClick={onBack}
        >
          ← Back to Home
        </button>

        <div className="auth-logo">AI</div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Sign in to your Farm AI account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) =>
                  setShowPassword(e.target.checked)
                }
                style={{ width: 'auto' }}
              />
              Show password
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit"
          >
            Sign In
          </button>

        </form>

        <div className="auth-switch">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={onSignup}
          >
            Create Account
          </button>
        </div>

      </div>
    </div>
  )
}

export default FarmerLogin