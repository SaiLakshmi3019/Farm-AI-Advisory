import { useState } from 'react'

function FarmerSignup({ onLogin, onBack }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    const user = {
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      location: location.trim(),
    }

    if (!user.name) {
      setError('Please enter your name.')
      return
    }

    if (!user.email) {
      setError('Please enter your email.')
      return
    }

    if (!user.password) {
      setError('Please enter your password.')
      return
    }

    if (user.password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    localStorage.setItem('farm_ai_user', JSON.stringify(user))

    setSuccess('Account created successfully!')

    setTimeout(() => {
      onLogin()
    }, 700)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <button
          type="button"
          onClick={onBack}
          style={styles.back}
        >
          ← Back to Home
        </button>

        <div style={styles.logo}>AI</div>

        <h1 style={styles.title}>Create Your Account</h1>

        <p style={styles.subtitle}>
          Join Farm AI Advisory
        </p>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <Field
            label="Full Name"
            value={name}
            setValue={setName}
            placeholder="Enter your full name"
            type="text"
          />

          <Field
            label="Email Address"
            value={email}
            setValue={setEmail}
            placeholder="Enter your email"
            type="text"
          />

          <div style={styles.group}>
            <label style={styles.label}>Password</label>

            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              style={styles.input}
            />

            <label style={styles.show}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) =>
                  setShowPassword(e.target.checked)
                }
              />
              Show password
            </label>
          </div>

          <Field
            label="Phone Number"
            value={phone}
            setValue={setPhone}
            placeholder="Enter phone number"
            type="text"
          />

          <Field
            label="Location"
            value={location}
            setValue={setLocation}
            placeholder="Enter your location"
            type="text"
          />

          <button type="submit" style={styles.submit}>
            Create Account
          </button>
        </form>

        <div style={styles.loginRow}>
          Already have an account?
          <button
            type="button"
            onClick={onLogin}
            style={styles.loginBtn}
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  )
}

function Field({
  label,
  value,
  setValue,
  placeholder,
  type,
}) {
  return (
    <div style={styles.group}>
      <label style={styles.label}>{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
        autoComplete="off"
      />
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '25px',
    background: 'linear-gradient(135deg,#edf8f1,#f8fbf9)',
  },

  card: {
    width: '100%',
    maxWidth: '470px',
    background: '#fff',
    borderRadius: '22px',
    padding: '32px',
    boxShadow: '0 18px 50px rgba(20,80,42,.12)',
    border: '1px solid #dfebe3',
  },

  back: {
    border: 'none',
    background: 'transparent',
    color: '#19753f',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    marginBottom: '20px',
  },

  logo: {
    width: '56px',
    height: '56px',
    borderRadius: '15px',
    background: '#1f8b4c',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontSize: '20px',
    fontWeight: 800,
    marginBottom: '16px',
  },

  title: {
    margin: 0,
    color: '#153125',
    fontSize: '30px',
  },

  subtitle: {
    color: '#76857c',
    margin: '7px 0 24px',
  },

  group: {
    marginBottom: '16px',
  },

  label: {
    display: 'block',
    marginBottom: '7px',
    color: '#263d30',
    fontWeight: 700,
    fontSize: '13px',
  },

  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '13px 14px',
    border: '1px solid #cad9cf',
    borderRadius: '10px',
    color: '#111',
    background: '#fff',
    fontSize: '15px',
    outline: 'none',
  },

  show: {
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontSize: '13px',
    color: '#647169',
  },

  submit: {
    width: '100%',
    border: 'none',
    borderRadius: '11px',
    padding: '14px',
    background: '#1f8b4c',
    color: '#fff',
    fontWeight: 800,
    fontSize: '15px',
    cursor: 'pointer',
  },

  loginRow: {
    marginTop: '20px',
    textAlign: 'center',
    color: '#728078',
    fontSize: '14px',
  },

  loginBtn: {
    border: 'none',
    background: 'transparent',
    color: '#19753f',
    fontWeight: 800,
    cursor: 'pointer',
    marginLeft: '5px',
  },

  error: {
    background: '#fff0f0',
    border: '1px solid #edcaca',
    color: '#b42318',
    padding: '11px',
    borderRadius: '9px',
    marginBottom: '15px',
    fontSize: '13px',
  },

  success: {
    background: '#edf8f0',
    border: '1px solid #cbe5d2',
    color: '#267542',
    padding: '11px',
    borderRadius: '9px',
    marginBottom: '15px',
    fontSize: '13px',
  },
}

export default FarmerSignup