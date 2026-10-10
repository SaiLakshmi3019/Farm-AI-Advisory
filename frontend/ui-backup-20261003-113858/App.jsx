import { useState } from 'react'
import FarmerDashboard from './FarmerDashboardV2.jsx'
import Chatbot from './Chatbot.jsx'
import './App.css'

function PasswordInput({
  value,
  onChange,
  placeholder,
  showPassword,
  setShowPassword,
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          paddingRight: '48px',
          boxSizing: 'border-box',
        }}
      />

      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        title={showPassword ? 'Hide password' : 'View password'}
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: '20px',
          padding: '4px',
        }}
      >
        {showPassword ? 'ðŸ™ˆ' : 'ðŸ‘ï¸'}
      </button>
    </div>
  )
}


// ============================================================
// SIGN UP
// ============================================================

function SignupScreen({ onLogin, onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const createAccount = () => {
    setMessage('')
    setError('')

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const user = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      location: location.trim(),
    }

    localStorage.setItem(
      'farm_ai_user',
      JSON.stringify(user)
    )

    setMessage(
      'Account created successfully. Please sign in.'
    )

    setTimeout(() => {
      onLogin()
    }, 800)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          type="button"
          className="auth-back"
          onClick={onBack}
        >
          â† Back
        </button>

        <div className="auth-logo">
          ðŸŒ±
        </div>

        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Create your farmer account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: '#e9f8ee',
              color: '#16733d',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {message}
          </div>
        )}

        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>

        <div className="form-group">
          <label>Confirm Password</label>

          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm password"
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
          />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Enter phone number"
          />
        </div>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
          />
        </div>

        <button
          type="button"
          className="auth-submit"
          onClick={createAccount}
        >
          Create Account
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onLogin}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#16803d',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </p>

      </div>
    </div>
  )
}


// ============================================================
// FORGOT PASSWORD
// ============================================================

function ForgotPasswordScreen({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const resetPassword = () => {
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!newPassword) {
      setError('Please enter a new password.')
      return
    }

    if (newPassword.length < 6) {
      setError(
        'New password must contain at least 6 characters.'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Demo account
    if (email.trim() === 'sai@gmail.com') {
      localStorage.setItem(
        'farm_ai_demo_password',
        newPassword
      )

      setMessage(
        'Password reset successfully. You can now sign in.'
      )

      setTimeout(() => {
        onBackToLogin()
      }, 1200)

      return
    }

    // Registered local user
    const savedUser = JSON.parse(
      localStorage.getItem('farm_ai_user') || 'null'
    )

    if (
      !savedUser ||
      savedUser.email !== email.trim()
    ) {
      setError(
        'No account found with this email.'
      )
      return
    }

    const updatedUser = {
      ...savedUser,
      password: newPassword,
    }

    localStorage.setItem(
      'farm_ai_user',
      JSON.stringify(updatedUser)
    )

    setMessage(
      'Password reset successfully. You can now sign in.'
    )

    setTimeout(() => {
      onBackToLogin()
    }, 1200)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          type="button"
          className="auth-back"
          onClick={onBackToLogin}
        >
          â† Back to Sign In
        </button>

        <div className="auth-logo">
          ðŸ”
        </div>

        <h1>Forgot Password?</h1>

        <p className="auth-subtitle">
          Create a new password for your account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div
            style={{
              background: '#e9f8ee',
              color: '#16733d',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '16px',
              fontSize: '14px',
            }}
          >
            {message}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
          />
        </div>

        <div className="form-group">
          <label>New Password</label>

          <PasswordInput
            value={newPassword}
            onChange={setNewPassword}
            placeholder="Enter new password"
            showPassword={showNewPassword}
            setShowPassword={setShowNewPassword}
          />
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>

          <PasswordInput
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Confirm new password"
            showPassword={showConfirmPassword}
            setShowPassword={setShowConfirmPassword}
          />
        </div>

        <button
          type="button"
          className="auth-submit"
          onClick={resetPassword}
        >
          Reset Password
        </button>

      </div>
    </div>
  )
}


// ============================================================
// LOGIN
// ============================================================

function LoginScreen({
  onLogin,
  onSignup,
  onBack,
  onForgotPassword,
}) {
  const savedUser = JSON.parse(
    localStorage.getItem('farm_ai_user') || 'null'
  )

  const demoPassword =
    localStorage.getItem(
      'farm_ai_demo_password'
    ) || 'FarmAI@123'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const login = () => {
    setError('')

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
      return
    }

    const enteredEmail = email.trim()

    const demoLogin =
      enteredEmail === 'sai@gmail.com' &&
      password === demoPassword

    const savedLogin =
      savedUser &&
      enteredEmail === savedUser.email &&
      password === savedUser.password

    if (!demoLogin && !savedLogin) {
      setError('Invalid email or password.')
      return
    }

    onLogin({
      farmer_id: demoLogin
        ? 3
        : 4,
      name: demoLogin
        ? 'sai'
        : savedUser.name,
      email: enteredEmail,
    })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <button
          type="button"
          className="auth-back"
          onClick={onBack}
        >
          â† Back
        </button>

        <div className="auth-logo">
          ðŸŒ±
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Sign in to your Farm AI account
        </p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '7px',
            }}
          >
            <label style={{ marginBottom: 0 }}>
              Password
            </label>

            <button
              type="button"
              onClick={onForgotPassword}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#16803d',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '13px',
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
            showPassword={showPassword}
            setShowPassword={setShowPassword}
          />
        </div>

        <button
          type="button"
          className="auth-submit"
          onClick={login}
        >
          Sign In
        </button>

        <p className="auth-switch">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSignup}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#16803d',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Create Account
          </button>
        </p>

      </div>
    </div>
  )
}


// ============================================================
// APP
// ============================================================

function App() {
  const [page, setPage] = useState('home')
  const [farmer, setFarmer] = useState(null)

  const handleLogin = (data) => {
    setFarmer(data)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setFarmer(null)
    setPage('home')
  }

  // -------------------------
  // CHATBOT
  // -------------------------

  if (
    page === 'chatbot' &&
    farmer
  ) {
    return (
      <Chatbot
        onBack={() =>
          setPage('dashboard')
        }
      />
    )
  }


  // -------------------------
  // DASHBOARD
  // -------------------------

  if (
    page === 'dashboard' &&
    farmer
  ) {
    return (
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
        }}
      >

        <FarmerDashboard
          farmer={farmer}
          onLogout={handleLogout}
          onHome={() =>
            setPage('home')
          }
        />

        <div
          style={{
            position: 'fixed',
            right: '25px',
            bottom: '95px',
            background: '#1f8b4c',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow:
              '0 5px 18px rgba(0,0,0,0.18)',
            zIndex: 9998,
          }}
        >
          AI Assistant
        </div>

        <button
          type="button"
          onClick={() =>
            setPage('chatbot')
          }
          style={{
            position: 'fixed',
            right: '25px',
            bottom: '25px',
            width: '65px',
            height: '65px',
            borderRadius: '50%',
            border: 'none',
            background: '#1f8b4c',
            color: 'white',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow:
              '0 8px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
          }}
          title="Open AI Chatbot"
        >
          ðŸ¤–
        </button>

      </div>
    )
  }


  // -------------------------
  // LOGIN
  // -------------------------

  if (page === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignup={() =>
          setPage('signup')
        }
        onBack={() =>
          setPage('home')
        }
        onForgotPassword={() =>
          setPage('forgot')
        }
      />
    )
  }


  // -------------------------
  // SIGNUP
  // -------------------------

  if (page === 'signup') {
    return (
      <SignupScreen
        onLogin={() =>
          setPage('login')
        }
        onBack={() =>
          setPage('home')
        }
      />
    )
  }


  // -------------------------
  // FORGOT PASSWORD
  // -------------------------

  if (page === 'forgot') {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() =>
          setPage('login')
        }
      />
    )
  }


  // -------------------------
  // LANDING PAGE
  // -------------------------

  return (
    <div className="landing-page">

      <nav className="navbar">

        <div className="brand">
          <span style={{ fontSize: '28px' }}>
            ðŸŒ±
          </span>

          <span>
            Farm AI Advisory
          </span>
        </div>

        <div className="nav-actions">

          <button
            type="button"
            className="nav-login"
            onClick={() =>
              setPage('login')
            }
          >
            Sign In
          </button>

          <button
            type="button"
            className="nav-signup"
            onClick={() =>
              setPage('signup')
            }
          >
            Get Started
          </button>

        </div>

      </nav>


      <section className="hero-section">

        <div className="hero-content">

          <h1>
            Smart Farming with{' '}
            <span>
              Artificial
              <br />
              Intelligence
            </span>
          </h1>

          <p>
            Detect crop diseases, identify
            agricultural problems, and get
            AI-powered recommendations for
            better farming.
          </p>

          <div className="hero-primary">

            <button
              type="button"
              onClick={() =>
                setPage('login')
              }
            >
              Start Analysis â†’
            </button>

            <button
              type="button"
              className="hero-secondary"
              onClick={() =>
                setPage('signup')
              }
            >
              Create Account
            </button>

          </div>

        </div>

      </section>

    </div>
  )
}

export default App

