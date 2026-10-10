import { useEffect, useState } from 'react'
import Chatbot from './Chatbot.jsx'
import CropDetection from './CropDetection.jsx'
import { FarmWorkspace } from './FarmTools.jsx'
import './App.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }

  if (name === 'leaf') {
    return (
      <svg {...common}>
        <path d="M20 4C12 4 6 8 6 14C6 17 8 19 11 19C17 19 20 12 20 4Z" />
        <path d="M4 20C7 16 10 13 16 9" />
      </svg>
    )
  }

  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="M3 10.5L12 3L21 10.5" />
        <path d="M5.5 9.5V21H18.5V9.5" />
        <path d="M9.5 21V14.5H14.5V21" />
      </svg>
    )
  }

  if (name === 'scan') {
    return (
      <svg {...common}>
        <path d="M7 3H5A2 2 0 003 5V7" />
        <path d="M17 3H19A2 2 0 0121 5V7" />
        <path d="M21 17V19A2 2 0 0119 21H17" />
        <path d="M7 21H5A2 2 0 013 19V17" />
        <rect x="7" y="7" width="10" height="10" rx="2" />
      </svg>
    )
  }

  if (name === 'history') {
    return (
      <svg {...common}>
        <path d="M3 12A9 9 0 1012 3" />
        <path d="M3 4V9H8" />
        <path d="M12 7V12L15 14" />
      </svg>
    )
  }

  if (name === 'report') {
    return (
      <svg {...common}>
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </svg>
    )
  }

  if (name === 'activity') {
    return (
      <svg {...common}>
        <path d="M5 4h14v17H5zM9 4V2h6v2M8 10h8M8 14h4M8 18h7" />
      </svg>
    )
  }

  if (name === 'calendar') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" />
      </svg>
    )
  }

  if (name === 'alert') {
    return (
      <svg {...common}>
        <path d="m12 3 9 17H3zM12 9v5M12 17h.01" />
      </svg>
    )
  }

  if (name === 'percent') {
    return (
      <svg {...common}>
        <path d="M7 17 17 7" />
        <circle cx="7.5" cy="7.5" r="2" />
        <circle cx="16.5" cy="16.5" r="2" />
      </svg>
    )
  }

  if (name === 'bulb') {
    return (
      <svg {...common}>
        <path d="M9 18H15" />
        <path d="M10 21H14" />
        <path d="M8.3 14.6C7.45 13.75 7 12.65 7 11.45A5 5 0 0117 11C17 12.35 16.5 13.55 15.62 14.55C14.95 15.3 14.45 16.2 14.15 17H9.9C9.58 16.05 9.1 15.32 8.3 14.6Z" />
      </svg>
    )
  }

  if (name === 'chat') {
    return (
      <svg {...common}>
        <path d="M4 6A4 4 0 018 2H16A4 4 0 0120 6V11A4 4 0 0116 15H11L6 19V15.8A4 4 0 014 12Z" />
      </svg>
    )
  }

  if (name === 'logout') {
    return (
      <svg {...common}>
        <path d="M10 4H6A2 2 0 004 6V18A2 2 0 006 20H10" />
        <path d="M14 8L18 12L14 16" />
        <path d="M18 12H9" />
      </svg>
    )
  }

  if (name === 'mail') {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="M4.5 7L12 13L19.5 7" />
      </svg>
    )
  }

  if (name === 'lock') {
    return (
      <svg {...common}>
        <rect x="4" y="10" width="16" height="10" rx="2.5" />
        <path d="M8 10V7.5C8 5.57 9.57 4 12 4C14.43 4 16 5.57 16 7.5V10" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5.5 20C6.2 16.7 8.35 15 12 15C15.65 15 17.8 16.7 18.5 20" />
      </svg>
    )
  }

  return null
}

/* =========================================================
   BRAND
========================================================= */

function Brand() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: '#197651',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Icon name="leaf" size={23} />
      </div>

      <div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 850,
            color: '#123e2e',
          }}
        >
          Farm AI
        </div>

        <div
          style={{
            fontSize: 10,
            color: '#71847b',
            marginTop: 3,
          }}
        >
          Advisory System
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   AUTH INPUT
========================================================= */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
}) {
  return (
    <div style={{ marginBottom: 17 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 750,
          color: '#284a3d',
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#7d9188',
            }}
          >
            <Icon name={icon} size={18} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 54,
            boxSizing: 'border-box',
            border: '1px solid #d8e5de',
            borderRadius: 14,
            background: '#f9fcfa',
            color: '#173d2e',
            padding: icon ? '0 15px 0 45px' : '0 15px',
            outline: 'none',
            fontSize: 14,
          }}
        />
      </div>
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ marginBottom: 17 }}>
      <label
        style={{
          display: 'block',
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 750,
          color: '#284a3d',
        }}
      >
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#7d9188',
          }}
        >
          <Icon name="lock" size={18} />
        </div>

        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: 54,
            boxSizing: 'border-box',
            border: '1px solid #d8e5de',
            borderRadius: 14,
            background: '#f9fcfa',
            color: '#173d2e',
            padding: '0 60px 0 45px',
            outline: 'none',
            fontSize: 14,
          }}
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            border: 0,
            background: 'transparent',
            color: '#6d8178',
            cursor: 'pointer',
          }}
        >
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}

/* =========================================================
   AUTH LAYOUT
========================================================= */

function AuthLayout({ title, subtitle, children, onBack }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#f4faf7',
      }}
    >
      <section
        style={{
          padding: 45,
          background:
            'linear-gradient(145deg,#073c2d,#106347,#1a7e5a)',
          color: '#fff',
        }}
      >
        <div style={{ position: 'sticky', top: 30 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'rgba(255,255,255,.12)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Icon name="leaf" size={23} />
            </div>

            <div>
              <div style={{ fontWeight: 850, fontSize: 19 }}>
                Farm AI
              </div>

              <div
                style={{
                  color: '#b8dccd',
                  fontSize: 10,
                }}
              >
                Advisory System
              </div>
            </div>
          </div>

          <div style={{ marginTop: 125, maxWidth: 570 }}>
            <div
              style={{
                color: '#a9dac5',
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: 1.5,
              }}
            >
              FARM AI ADVISORY SYSTEM
            </div>

            <h2
              style={{
                fontSize: 48,
                lineHeight: 1.05,
                margin: '13px 0 18px',
              }}
            >
              Smarter decisions
              <br />
              for healthier crops.
            </h2>

            <p
              style={{
                color: '#d7ece3',
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              AI-powered crop monitoring, disease detection and
              practical farming guidance in one workspace.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          background: '#fff',
          padding: '45px 8%',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 520, margin: 'auto' }}>
          <button
            type="button"
            onClick={onBack}
            style={{
              border: 0,
              background: 'transparent',
              color: '#247050',
              cursor: 'pointer',
              padding: 0,
              marginBottom: 45,
            }}
          >
            ← Back to Home
          </button>

          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: '#eaf7f0',
              color: '#197651',
              display: 'grid',
              placeItems: 'center',
              marginBottom: 18,
            }}
          >
            <Icon name="leaf" size={24} />
          </div>

          <h1
            style={{
              margin: 0,
              color: '#123e2e',
              fontSize: 40,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              color: '#788a82',
              margin: '9px 0 28px',
            }}
          >
            {subtitle}
          </p>

          {children}
        </div>
      </section>
    </div>
  )
}

/* =========================================================
   HOME
========================================================= */

function HomePage({ onLogin, onSignup, onChatbot }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5faf7',
      }}
    >
      <nav
        className="home-nav"
        style={{
          height: 76,
          padding: '0 6%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          borderBottom: '1px solid #e8efeb',
        }}
      >
        <Brand />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onLogin}
            style={{
              border: 0,
              background: 'transparent',
              color: '#176b4b',
              fontWeight: 750,
              cursor: 'pointer',
              padding: '10px 15px',
            }}
          >
            Sign In
          </button>

          <button
            type="button"
            className="home-chat-button"
            onClick={onChatbot}
          >
            <Icon name="chat" size={17} />
            Ask Farm AI
          </button>

          <button
            type="button"
            onClick={onSignup}
            style={{
              border: 0,
              background: '#197651',
              color: '#fff',
              borderRadius: 11,
              padding: '11px 18px',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Get Started
          </button>
        </div>
      </nav>

      <main
        className="home-hero"
        style={{
          maxWidth: 1250,
          margin: '0 auto',
          padding: '70px 6%',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 50,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              color: '#16815a',
              fontSize: 11,
              fontWeight: 850,
              letterSpacing: 1.5,
            }}
          >
            FARM AI ADVISORY SYSTEM
          </div>

          <h1
            style={{
              margin: '15px 0',
              color: '#0d4635',
              fontSize: 'clamp(42px,5vw,68px)',
              lineHeight: 1.02,
            }}
          >
            Smarter farming.
            <br />
            Healthier crops.
          </h1>

          <p
            style={{
              maxWidth: 600,
              color: '#6d8077',
              fontSize: 16,
              lineHeight: 1.7,
            }}
          >
            AI-powered crop monitoring, disease detection and
            practical agricultural guidance for better farm decisions.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 25,
            }}
          >
            <button
              type="button"
              onClick={onSignup}
              style={{
                border: 0,
                background: '#197651',
                color: '#fff',
                borderRadius: 12,
                padding: '14px 20px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Create Account →
            </button>

            <button
              type="button"
              onClick={onLogin}
              style={{
                border: '1px solid #d4e2da',
                background: '#fff',
                color: '#176b4b',
                borderRadius: 12,
                padding: '14px 20px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              className="home-chat-button"
              onClick={onChatbot}
            >
              <Icon name="chat" size={17} />
              Ask Farm AI
            </button>
          </div>
        </div>

          <div className="home-farm-visual">
            <div className="home-farm-main-photo">
              <img src="/images/tomato.jpg" alt="Ripe tomatoes growing on the vine" />
              <div className="home-photo-caption">
                <span>FIELD NOTES</span>
                <strong>Observe the crop. Ask better questions.</strong>
              </div>
            </div>
            <div className="home-farm-photo-row">
              <img src="/images/potato.jpg" alt="Potatoes freshly lifted from healthy soil" />
              <img src="/images/pepper.jpg" alt="Green peppers growing among leaves" />
            </div>
        </div>
      </main>

      <section className="home-crop-strip" aria-labelledby="home-crops-title">
        <div className="home-crop-strip-heading">
          <div>
            <span>FROM THE FIELD</span>
            <h2 id="home-crops-title">A closer look at your crops</h2>
          </div>
          <button type="button" onClick={onChatbot}>
            Ask a farm question <Icon name="arrow" size={16} />
          </button>
        </div>
        <div className="home-crop-photos">
          {[
            ['Tomato', '/images/tomato.jpg', 'Tomatoes on the vine'],
            ['Potato', '/images/potato.jpg', 'Potatoes in rich soil'],
            ['Pepper', '/images/pepper.jpg', 'Green peppers on the plant'],
            ['Corn', '/images/corn.jpg', 'Corn growing in a field'],
          ].map(([crop, image, description]) => (
            <figure className="home-crop-photo" key={crop}>
              <img src={image} alt={description} loading="lazy" />
              <figcaption>{crop}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  )
}

/* =========================================================
   LOGIN
========================================================= */

function LoginScreen({
  onLogin,
  onSignup,
  onBack,
  onForgotPassword,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const demoPassword =
    localStorage.getItem('farm_ai_demo_password') || 'FarmAI@123'

  const login = () => {
    setError('')

    const enteredEmail = email.trim()
    const savedUser = JSON.parse(
      localStorage.getItem('farm_ai_user') || 'null',
    )

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
      farmer_id: demoLogin ? 3 : savedUser.farmer_id || 4,
      name: demoLogin ? 'sai lakshmi Mogili' : savedUser.name,
      email: enteredEmail,
    })
  }

  return (
    <AuthLayout
      title="Welcome back."
      subtitle="Sign in to continue to your farm workspace."
      onBack={onBack}
    >
      {error && (
        <div
          style={{
            background: '#fff1f0',
            color: '#a32d25',
            border: '1px solid #f0c9c6',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <Field
        label="Email address"
        value={email}
        onChange={setEmail}
        placeholder="Enter your email"
        type="email"
        icon="mail"
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Enter your password"
      />

      <button
        type="button"
        onClick={onForgotPassword}
        style={{
          border: 0,
          background: 'transparent',
          color: '#197651',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 18,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Forgot password?
      </button>

      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: '#eff9f3',
          color: '#24704e',
          fontSize: 12,
          marginBottom: 18,
        }}
      >
        Demo: <strong>sai@gmail.com</strong> /{' '}
        <strong>{demoPassword}</strong>
      </div>

      <button
        type="button"
        onClick={login}
        style={{
          width: '100%',
          height: 55,
          border: 0,
          borderRadius: 14,
          background: '#197651',
          color: '#fff',
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Sign In →
      </button>

      <div
        style={{
          textAlign: 'center',
          marginTop: 22,
          fontSize: 13,
          color: '#778a82',
        }}
      >
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSignup}
          style={{
            border: 0,
            background: 'transparent',
            color: '#197651',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Create Account
        </button>
      </div>
    </AuthLayout>
  )
}

/* =========================================================
   SIGNUP
========================================================= */

function SignupScreen({ onLogin, onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState('')

  const signup = () => {
    setError('')

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in name, email and password.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    const farmerId = Date.now()
    const farmerProfile = {
      farmer_id: farmerId,
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      location: location.trim(),
    }

    localStorage.setItem('farm_ai_user', JSON.stringify(farmerProfile))
    onLogin({
      farmer_id: farmerId,
      name: farmerProfile.name,
      email: farmerProfile.email,
    })
  }

  return (
    <AuthLayout
      title="Create account."
      subtitle="Set up your Farm AI farmer account."
      onBack={onBack}
    >
      {error && (
        <div
          style={{
            background: '#fff1f0',
            color: '#a32d25',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      <Field
        label="Full name"
        value={name}
        onChange={setName}
        placeholder="Enter your name"
        icon="user"
      />

      <Field
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="Enter your email"
        type="email"
        icon="mail"
      />

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        placeholder="Create password"
      />

      <PasswordField
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Confirm password"
      />

      <Field
        label="Phone"
        value={phone}
        onChange={setPhone}
        placeholder="Optional"
      />

      <Field
        label="Location"
        value={location}
        onChange={setLocation}
        placeholder="Optional"
      />

      <button
        type="button"
        onClick={signup}
        style={{
          width: '100%',
          height: 55,
          border: 0,
          borderRadius: 14,
          background: '#197651',
          color: '#fff',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Create Account
      </button>
    </AuthLayout>
  )
}

/* =========================================================
   FORGOT PASSWORD
========================================================= */

function ForgotPasswordScreen({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const reset = () => {
    setError('')
    setMessage('')

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    if (email.trim() === 'sai@gmail.com') {
      localStorage.setItem(
        'farm_ai_demo_password',
        password,
      )

      setMessage('Password reset successfully.')

      setTimeout(() => {
        onBackToLogin()
      }, 800)

      return
    }

    const savedUser = JSON.parse(
      localStorage.getItem('farm_ai_user') || 'null',
    )

    if (!savedUser || savedUser.email !== email.trim()) {
      setError('No account found with this email.')
      return
    }

    savedUser.password = password

    localStorage.setItem(
      'farm_ai_user',
      JSON.stringify(savedUser),
    )

    setMessage('Password reset successfully.')

    setTimeout(() => {
      onBackToLogin()
    }, 800)
  }

  return (
    <AuthLayout
      title="Reset password."
      subtitle="Create a new password for your account."
      onBack={onBackToLogin}
    >
      {error && (
        <div
          style={{
            background: '#fff1f0',
            color: '#a32d25',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: '#eff9f3',
            color: '#24704e',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          {message}
        </div>
      )}

      <Field
        label="Email"
        value={email}
        onChange={setEmail}
        placeholder="Enter your email"
        type="email"
        icon="mail"
      />

      <PasswordField
        label="New password"
        value={password}
        onChange={setPassword}
        placeholder="Enter new password"
      />

      <PasswordField
        label="Confirm password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Confirm new password"
      />

      <button
        type="button"
        onClick={reset}
        style={{
          width: '100%',
          height: 55,
          border: 0,
          borderRadius: 14,
          background: '#197651',
          color: '#fff',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Reset Password
      </button>
    </AuthLayout>
  )
}

/* =========================================================
   DASHBOARD
========================================================= */

export function Dashboard({
  farmer,
  onLogout,
  onHome,
}) {
  const name = farmer?.name || 'Farmer'
  const email = farmer?.email || ''
  const farmerId = farmer?.id || farmer?.farmer_id || farmer?.user_id || 1
  const [activePage, setActivePage] =
    useState('dashboard')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    if (!['dashboard', 'history', 'reports'].includes(activePage)) return undefined

    let active = true

    fetch(`${API_BASE}/detection/history/${farmerId}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.detail || 'Could not load analysis history.')
        return data.history || []
      })
      .then((items) => {
        if (active) {
          setHistory(items)
          setHistoryError('')
        }
      })
      .catch((error) => {
        if (active) setHistoryError(error.message || 'Could not connect to the Farm AI backend.')
      })
      .finally(() => {
        if (active) setHistoryLoading(false)
      })

    return () => { active = false }
  }, [activePage, farmerId])

  const navItems = [
    ['dashboard', 'Dashboard', 'home'],
    ['detection', 'Crop Detection', 'scan'],
    ['chatbot', 'AI Chatbot', 'chat'],
    ['history', 'Analysis History', 'history'],
    ['reports', 'Report Management', 'report'],
    ['activities', 'Farm Activities', 'activity'],
    ['planner', 'Crop Calendar', 'calendar'],
    ['recommendations', 'Recommendations', 'bulb'],
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f4f8f6',
        fontFamily:
          'Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif',
      }}
    >
      {/* SIDEBAR */}

      <aside
        style={{
          width: 245,
          minWidth: 245,
          minHeight: '100vh',
          padding: 15,
          boxSizing: 'border-box',
          background:
            'linear-gradient(180deg,#073d2d,#0a4937 60%,#062e23)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            padding: '8px 9px 20px',
            borderBottom:
              '1px solid rgba(255,255,255,.1)',
          }}
        >
          <div
            style={{
              width: 43,
              height: 43,
              borderRadius: 13,
              background: '#197651',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <Icon name="leaf" size={23} />
          </div>

          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 850,
              }}
            >
              Farm AI
            </div>

            <div
              style={{
                color: '#b3d4c6',
                fontSize: 10,
                marginTop: 3,
              }}
            >
              Advisory System
            </div>
          </div>
        </div>

        <div
          style={{
            color: '#89ad9f',
            fontSize: 9,
            letterSpacing: 1.5,
            fontWeight: 800,
            margin: '23px 9px 11px',
          }}
        >
          WORKSPACE
        </div>

        {navItems.map(([id, label, icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setActivePage(id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '12px 13px',
              marginBottom: 5,
              border: 0,
              borderRadius: 11,
              background:
                activePage === id
                  ? '#197651'
                  : 'transparent',
              color:
                activePage === id
                  ? '#fff'
                  : '#d0e2da',
              fontWeight:
                activePage === id ? 800 : 500,
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Icon name={icon} size={18} />
            {label}
          </button>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div
            style={{
              height: 1,
              background:
                'rgba(255,255,255,.1)',
              margin: '15px 9px',
            }}
          />

          <button
            type="button"
            onClick={onHome}
            style={{
              width: '100%',
              border: 0,
              background: 'transparent',
              color: '#dcebe4',
              padding: '11px 13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            ← Back to Home
          </button>

          <button
            type="button"
            onClick={onLogout}
            style={{
              width: '100%',
              border: 0,
              background: 'transparent',
              color: '#f2c5c0',
              padding: '11px 13px',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <main
        style={{
          flex: 1,
          minWidth: 0,
          padding: '25px 30px 35px',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 15,
            flexWrap: 'wrap',
            marginBottom: 23,
          }}
        >
          <div>
            <div
              style={{
                color: '#7d8d85',
                fontSize: 12,
                marginBottom: 5,
              }}
            >
              Welcome back
            </div>

            <div
              style={{
                color: '#173d2e',
                fontSize: 24,
                fontWeight: 850,
              }}
            >
              {name}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border:
                '1px solid #e0ebe5',
              borderRadius: 14,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: '#e8f5ee',
                color: '#197651',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 850,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div
                style={{
                  fontWeight: 750,
                  fontSize: 13,
                  color: '#244638',
                }}
              >
                {name}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: '#87978f',
                  marginTop: 2,
                }}
              >
                {email}
              </div>
            </div>
          </div>
        </div>

        {/* DASHBOARD HOME */}

        {activePage === 'dashboard' && (
          <>
            <section
              style={{
                minHeight: 300,
                borderRadius: 21,
                overflow: 'hidden',
                background:
                  'linear-gradient(120deg,#073f2e,#126c4d,#247f5e)',
                marginBottom: 20,
                color: '#fff',
              }}
            >
              <div
                style={{
                  padding: 40,
                  maxWidth: 650,
                }}
              >
                <div
                  style={{
                    color: '#b8dfce',
                    fontSize: 10,
                    fontWeight: 850,
                    letterSpacing: 1.4,
                  }}
                >
                  SMART FARM MONITORING
                </div>

                <h1
                  style={{
                    fontSize: 40,
                    lineHeight: 1.04,
                    margin: '11px 0 13px',
                  }}
                >
                  Better insights.
                  <br />
                  Healthier crops.
                </h1>

                <p
                  style={{
                    color: '#d8ece4',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  Analyze crop images with AI, understand
                  farm conditions and turn results into
                  practical next steps.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setActivePage('detection')
                  }
                  style={{
                    marginTop: 18,
                    border: 0,
                    borderRadius: 11,
                    background: '#fff',
                    color: '#166948',
                    padding: '11px 16px',
                    fontWeight: 850,
                    cursor: 'pointer',
                  }}
                >
                  Start Crop Analysis →
                </button>
              </div>
            </section>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4,minmax(0,1fr))',
                gap: 13,
                marginBottom: 20,
              }}
            >
              {[
                ['scan', '0', 'Total Analyses', 'Images analyzed'],
                ['leaf', '0', 'Healthy Results', 'No issue detected'],
                ['bulb', '0', 'Issues Detected', 'Needs attention'],
                ['chat', 'AI', 'Advisory Support', 'Available anytime'],
              ].map(([icon, value, title, text]) => (
                <div
                  key={title}
                  style={{
                    background: '#fff',
                    border:
                      '1px solid #e0ebe5',
                    borderRadius: 17,
                    padding: 18,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: '#eaf7f0',
                      color: '#197651',
                      display: 'grid',
                      placeItems: 'center',
                      marginBottom: 13,
                    }}
                  >
                    <Icon name={icon} size={18} />
                  </div>

                  <div
                    style={{
                      color: '#173d2e',
                      fontSize: 27,
                      fontWeight: 850,
                    }}
                  >
                    {value}
                  </div>

                  <div
                    style={{
                      color: '#315447',
                      fontWeight: 750,
                      fontSize: 13,
                      marginTop: 6,
                    }}
                  >
                    {title}
                  </div>

                  <div
                    style={{
                      color: '#829089',
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>

            <section
              style={{
                background: '#fff',
                border:
                  '1px solid #e0ebe5',
                borderRadius: 18,
                padding: 20,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: '#193f30',
                  fontSize: 18,
                }}
              >
                Quick Actions
              </h2>

              <p
                style={{
                  color: '#7c8c84',
                  fontSize: 12,
                  marginTop: 5,
                }}
              >
                Access your main farming tools.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(3,minmax(0,1fr))',
                  gap: 13,
                  marginTop: 15,
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setActivePage('detection')
                  }
                  style={actionStyle}
                >
                  <Icon name="scan" size={22} />
                  <strong>Crop Detection</strong>
                  <span>
                    Upload an image and analyze it.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActivePage('history')
                  }
                  style={actionStyle}
                >
                  <Icon name="history" size={22} />
                  <strong>Analysis History</strong>
                  <span>
                    Review previous results.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActivePage('recommendations')
                  }
                  style={actionStyle}
                >
                  <Icon name="bulb" size={22} />
                  <strong>Recommendations</strong>
                  <span>
                    View practical farm guidance.
                  </span>
                </button>
              </div>
            </section>
          </>
        )}

        {/* ACTUAL CROP DETECTION */}

        {activePage === 'detection' && (
          <section>
            <h1
              style={{
                margin: 0,
                color: '#173d2e',
                fontSize: 30,
              }}
            >
              Crop Detection
            </h1>

            <p
              style={{
                color: '#778981',
                fontSize: 13,
                marginTop: 7,
                marginBottom: 20,
              }}
            >
              Upload a crop image for AI-powered analysis.
            </p>

            {/* THIS IS THE IMPORTANT PART */}
            <CropDetection farmer={farmer} />
          </section>
        )}

        {activePage === 'chatbot' && (
          <Chatbot onBack={() => setActivePage('dashboard')} />
        )}

        {/* HISTORY */}

        {activePage === 'history' && (
          <section>
            <h1
              style={{
                margin: 0,
                color: '#173d2e',
                fontSize: 30,
              }}
            >
              Analysis History
            </h1>

            <p
              style={{
                color: '#778981',
                marginBottom: 20,
              }}
            >
              Review previous crop analysis results.
            </p>

            {historyLoading ? (
              <div style={{ padding: 24, color: '#718076' }}>Loading saved analyses...</div>
            ) : historyError ? (
              <div role="alert" style={{ padding: 18, border: '1px solid #e8c7bd', background: '#fff7f4', color: '#8c4636' }}>{historyError}</div>
            ) : history.length === 0 ? (
              <div style={{ background: '#fff', border: '1px solid #e0ebe5', borderRadius: 8, padding: 40, textAlign: 'center' }}>
                <Icon name="history" size={34} />
                <h2 style={{ color: '#244638' }}>No analysis history yet</h2>
                <p style={{ color: '#7b8b84' }}>Your saved crop screenings will appear here.</p>
              </div>
            ) : (
              <div style={{ overflow: 'hidden', background: '#fff', border: '1px solid #e0ebe5', borderRadius: 8 }}>
                {history.map((item) => (
                  <article key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: 16, padding: '14px 18px', borderBottom: '1px solid #edf1ed' }}>
                    <div>
                      <strong style={{ display: 'block', color: '#244638', fontSize: 14 }}>{item.disease || 'Unclassified condition'}</strong>
                      <span style={{ color: '#718076', fontSize: 12 }}>{item.crop_type || 'Unknown crop'} · {item.created_at ? new Date(`${item.created_at}Z`).toLocaleString() : 'Date unavailable'}</span>
                    </div>
                    <strong style={{ color: '#244638', fontSize: 13 }}>{Number(item.confidence || 0).toFixed(1)}%<span style={{ display: 'block', color: '#718076', fontSize: 10, fontWeight: 400 }}>model score</span></strong>
                    <span style={{ color: '#765d34', fontSize: 11 }}>{item.severity || 'Needs assessment'}</span>
                  </article>
                ))}
                <p style={{ margin: 0, padding: '12px 18px', color: '#718076', fontSize: 11 }}>Confidence history is not a measure of disease severity or progression. Compare crop symptoms in the field.</p>
              </div>
            )}
          </section>
        )}

        {/* RECOMMENDATIONS */}

        {activePage === 'recommendations' && (
          <section>
            <h1
              style={{
                margin: 0,
                color: '#173d2e',
                fontSize: 30,
              }}
            >
              Recommendations
            </h1>

            <p
              style={{
                color: '#778981',
                marginBottom: 20,
              }}
            >
              Practical guidance for your crops.
            </p>

            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #e0ebe5',
                borderRadius: 18,
                padding: 25,
              }}
            >
              {[
                ['01', 'Monitor regularly'],
                ['02', 'Review detected issues'],
                ['03', 'Act early'],
              ].map(([num, title]) => (
                <div
                  key={num}
                  style={{
                    display: 'flex',
                    gap: 13,
                    padding: '16px 0',
                    borderBottom:
                      num !== '03'
                        ? '1px solid #edf2ef'
                        : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: '#eaf7f0',
                      color: '#197651',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 11,
                      fontWeight: 850,
                    }}
                  >
                    {num}
                  </div>

                  <div>
                    <div
                      style={{
                        color: '#234637',
                        fontWeight: 800,
                      }}
                    >
                      {title}
                    </div>

                    <div
                      style={{
                        color: '#7d8c85',
                        fontSize: 11,
                        marginTop: 4,
                      }}
                    >
                      Use Farm AI to monitor and improve crop
                      health decisions.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

const actionStyle = {
  border: '1px solid #e0ebe5',
  background: '#fff',
  borderRadius: 15,
  padding: 17,
  textAlign: 'left',
  cursor: 'pointer',
  color: '#197651',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
}

export default function App() {
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

  if (page === 'chatbot') {
    return <Chatbot onBack={() => setPage('home')} />
  }

if (page === 'dashboard' && farmer) {
  return (
    <FarmWorkspace
      farmer={farmer}
      onLogout={handleLogout}
      onHome={() => setPage('home')}
    />
  )
}
  if (page === 'login') {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onSignup={() => setPage('signup')}
        onBack={() => setPage('home')}
        onForgotPassword={() => setPage('forgot')}
      />
    )
  }

  if (page === 'signup') {
    return (
      <SignupScreen
        onLogin={() => setPage('login')}
        onBack={() => setPage('home')}
      />
    )
  }

  if (page === 'forgot') {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() => setPage('login')}
      />
    )
  }

  return (
    <HomePage
      onLogin={() => setPage('login')}
      onSignup={() => setPage('signup')}
      onChatbot={() => setPage('chatbot')}
    />
  )
}