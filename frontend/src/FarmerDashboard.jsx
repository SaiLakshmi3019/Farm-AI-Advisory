import { useState } from 'react'
import CropDetection from './CropDetection.jsx'
import Chatbot from './Chatbot.jsx'

function FarmerDashboard({ farmer, onLogout, onHome }) {
  const [activePage, setActivePage] = useState('dashboard')

  const name = farmer?.name || 'Farmer'
  const email = farmer?.email || ''

  const goHome = () => {
    if (onHome) {
      onHome()
    } else {
      window.location.reload()
    }
  }

  const logout = () => {
    if (onLogout) {
      onLogout()
    } else {
      window.location.reload()
    }
  }

  if (activePage === 'detection') {
    return (
      <DashboardShell
        name={name}
        email={email}
        activePage={activePage}
        setActivePage={setActivePage}
        goHome={goHome}
        logout={logout}
      >
        <div className="fd-page-heading">
          <h1>Crop Detection</h1>
          <p>
            Upload a crop image for AI-powered disease analysis.
          </p>
        </div>

        <CropDetection farmer={farmer} />
      </DashboardShell>
    )
  }

  if (activePage === 'chatbot') {
    return (
      <DashboardShell
        name={name}
        email={email}
        activePage={activePage}
        setActivePage={setActivePage}
        goHome={goHome}
        logout={logout}
      >
        <Chatbot
          onBack={() => setActivePage('dashboard')}
        />
      </DashboardShell>
    )
  }

  if (activePage === 'history') {
    return (
      <DashboardShell
        name={name}
        email={email}
        activePage={activePage}
        setActivePage={setActivePage}
        goHome={goHome}
        logout={logout}
      >
        <div className="fd-page-heading">
          <h1>Analysis History</h1>
          <p>
            Review your previous crop analysis results.
          </p>
        </div>

        <div className="fd-simple-card">
          <div className="fd-empty-icon fd-empty-icon-large">
            ◷
          </div>

          <h2>No analysis yet</h2>

          <p>
            Upload your first crop image to see your analysis
            history.
          </p>

          <button
            className="fd-primary-btn"
            onClick={() => setActivePage('detection')}
          >
            Start Crop Analysis →
          </button>
        </div>
      </DashboardShell>
    )
  }

  if (activePage === 'recommendations') {
    return (
      <DashboardShell
        name={name}
        email={email}
        activePage={activePage}
        setActivePage={setActivePage}
        goHome={goHome}
        logout={logout}
      >
        <div className="fd-page-heading">
          <h1>Recommendations</h1>
          <p>
            Smart agricultural guidance for your farm.
          </p>
        </div>

        <div className="fd-recommendation-page">
          <div className="fd-rec-icon fd-rec-icon-large">
            ✦
          </div>

          <div>
            <h2>
              Get personalized crop recommendations
            </h2>

            <p>
              Upload a crop image and receive disease detection,
              confidence information, and practical farming guidance.
            </p>

            <button
              className="fd-primary-btn"
              onClick={() => setActivePage('detection')}
            >
              Start Crop Analysis →
            </button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (activePage === 'profile') {
    return (
      <DashboardShell
        name={name}
        email={email}
        activePage={activePage}
        setActivePage={setActivePage}
        goHome={goHome}
        logout={logout}
      >
        <div className="fd-page-heading">
          <h1>My Profile</h1>
          <p>
            Your farmer account information.
          </p>
        </div>

        <div className="fd-profile-card">
          <div className="fd-profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2>{name}</h2>
            <p>{email}</p>

            <span>
              Farmer Account
            </span>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      name={name}
      email={email}
      activePage="dashboard"
      setActivePage={setActivePage}
      goHome={goHome}
      logout={logout}
    >
      {/* HERO */}
      <section className="fd-hero">
        <div className="fd-hero-content">
          <div className="fd-eyebrow">
            SMART FARMING
            <span>•</span>
            BETTER YIELDS
            <span>•</span>
            SUSTAINABLE FUTURE
          </div>

          <h1>
            Healthy Crops,
            <br />
            Brighter Future
          </h1>

          <p>
            Use AI to detect diseases, get expert recommendations
            and make better decisions for your farm.
          </p>

          <button
            className="fd-hero-btn"
            onClick={() => setActivePage('detection')}
          >
            Start Crop Analysis →
          </button>
        </div>

        <div className="fd-hero-visual">
          <div className="fd-tech-circle fd-tech-one">
            <span>◌</span>
          </div>

          <div className="fd-tech-circle fd-tech-two">
            <span>⌁</span>
          </div>

          <div className="fd-tech-circle fd-tech-three">
            <span>✦</span>
          </div>

          <div className="fd-plant">
            <div className="fd-stem" />
            <div className="fd-leaf fd-leaf-left" />
            <div className="fd-leaf fd-leaf-right" />
            <div className="fd-soil" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="fd-stats">
        <StatCard
          icon="AI"
          title="Total Analyses"
          value="0"
          footer="AI crop scans"
        />

        <StatCard
          icon="✓"
          title="Healthy Crops"
          value="0"
          footer="Healthy results"
        />

        <StatCard
          icon="!"
          title="Diseases Found"
          value="0"
          footer="Needs attention"
          danger
        />

        <StatCard
          icon="%"
          title="Avg. Confidence"
          value="0%"
          footer="AI confidence"
        />
      </section>

      {/* RECENT + RECOMMENDATIONS */}
      <section className="fd-two-panels">
        <div className="fd-panel">
          <div className="fd-panel-header">
            <div>
              <h2>Recent Analysis</h2>
              <p>Your latest crop health results</p>
            </div>

            <button
              onClick={() => setActivePage('history')}
            >
              View All →
            </button>
          </div>

          <div className="fd-empty-state">
            <div className="fd-empty-icon fd-empty-icon-large">
              ◌
            </div>

            <h3>No analysis yet</h3>

            <p>
              Upload your first crop image to begin.
            </p>
          </div>
        </div>

        <div className="fd-panel">
          <div className="fd-panel-header">
            <div>
              <h2>AI Recommendations</h2>
              <p>Smart farming guidance</p>
            </div>
          </div>

          <div className="fd-rec-box">
            <div className="fd-rec-icon">
              ✦
            </div>

            <div>
              <h3>
                Get personalized recommendations
              </h3>

              <p>
                Upload a crop image to receive disease detection
                and practical crop-specific guidance.
              </p>

              <button
                onClick={() => setActivePage('detection')}
              >
                Start Analysis →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}
      <section className="fd-quick-section">
        <div className="fd-quick-heading">
          <div>
            <span>FARM AI TOOLS</span>

            <h2>Quick Actions</h2>
          </div>

          <p>
            Access important features quickly
          </p>
        </div>

        <div className="fd-quick-grid">
          <QuickAction
            icon="⌾"
            title="Crop Detection"
            text="Analyze a crop image"
            onClick={() => setActivePage('detection')}
            tone="green"
          />

          <QuickAction
            icon="◫"
            title="AI Chatbot"
            text="Ask farming questions"
            onClick={() => setActivePage('chatbot')}
            tone="blue"
          />

          <QuickAction
            icon="◷"
            title="Analysis History"
            text="View previous results"
            onClick={() => setActivePage('history')}
            tone="purple"
          />

          <QuickAction
            icon="✦"
            title="Recommendations"
            text="Get expert advice"
            onClick={() => setActivePage('recommendations')}
            tone="orange"
          />
        </div>
      </section>

      {/* WHY FARM AI */}
      <section className="fd-why-section">
        <div className="fd-why-heading">
          <span>WHY FARM AI</span>

          <h2>
            Smarter Decisions for Every Growing Season
          </h2>

          <p>
            Detect crop problems early, understand what is happening,
            and take practical action with AI-powered guidance.
          </p>
        </div>

        <div className="fd-why-grid">
          <WhyCard
            icon="⌾"
            title="Early Detection"
            text="Identify possible crop health problems earlier through AI image analysis."
            tone="green"
          />

          <WhyCard
            icon="✦"
            title="AI-Powered Insights"
            text="Get clear crop-health information with confidence scores and understandable results."
            tone="blue"
          />

          <WhyCard
            icon="↗"
            title="Actionable Guidance"
            text="Receive practical recommendations for monitoring, prevention and next actions."
            tone="orange"
          />
        </div>

        <div className="fd-bottom-strip">
          <div>
            <strong>
              Built for practical farming
            </strong>

            <span>
              Simple AI tools for crop health, recommendations
              and better day-to-day decisions.
            </span>
          </div>

          <button
            onClick={() => setActivePage('detection')}
          >
            Start Your First Analysis →
          </button>
        </div>
      </section>
    </DashboardShell>
  )
}

function StatCard({
  icon,
  title,
  value,
  footer,
  danger = false,
}) {
  return (
    <div className="fd-stat-card">
      <div
        className={`fd-stat-icon ${danger ? 'danger' : ''}`}
      >
        {icon}
      </div>

      <div className="fd-stat-content">
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{footer}</small>
      </div>
    </div>
  )
}

function QuickAction({
  icon,
  title,
  text,
  onClick,
  tone,
}) {
  return (
    <button
      className={`fd-quick-card ${tone}`}
      onClick={onClick}
    >
      <div className="fd-quick-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <b>→</b>
    </button>
  )
}

function WhyCard({
  icon,
  title,
  text,
  tone,
}) {
  return (
    <div className="fd-why-card">
      <div className={`fd-why-icon ${tone}`}>
        {icon}
      </div>

      <div>
        <h3>{title}</h3>

        <p>{text}</p>
      </div>
    </div>
  )
}

function DashboardShell({
  name,
  email,
  activePage,
  setActivePage,
  goHome,
  logout,
  children,
}) {
  const navClass = (page) =>
    `fd-nav-item ${activePage === page ? 'active' : ''}`

  return (
    <div className="fd-app">
      <aside className="fd-sidebar">
        <div className="fd-brand">
          <div className="fd-brand-mark">
            ✦
          </div>

          <div>
            <strong>Farm AI</strong>
            <span>Advisory System</span>
          </div>
        </div>

        <nav className="fd-nav">
          <button
            className={navClass('dashboard')}
            onClick={() => setActivePage('dashboard')}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={navClass('detection')}
            onClick={() => setActivePage('detection')}
          >
            <span>◌</span>
            Crop Detection
          </button>

          <button
            className={navClass('chatbot')}
            onClick={() => setActivePage('chatbot')}
          >
            <span>▣</span>
            AI Chatbot
          </button>

          <button
            className={navClass('history')}
            onClick={() => setActivePage('history')}
          >
            <span>◷</span>
            Analysis History
          </button>

          <button
            className={navClass('recommendations')}
            onClick={() => setActivePage('recommendations')}
          >
            <span>✦</span>
            Recommendations
          </button>
        </nav>

        <div className="fd-sidebar-bottom">
          <button
            className={navClass('profile')}
            onClick={() => setActivePage('profile')}
          >
            <span>♙</span>
            My Profile
          </button>

          <button
            className="fd-nav-item"
            onClick={goHome}
          >
            <span>⌂</span>
            Back to Home
          </button>

          <button
            className="fd-nav-item logout"
            onClick={logout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="fd-main">
        <header className="fd-topbar">
          <div>
            <div className="fd-top-label">
              FARM AI ADVISORY
            </div>

            <h2>
              {activePage === 'dashboard'
                ? 'Farmer Dashboard'
                : activePage === 'detection'
                  ? 'Crop Detection'
                  : activePage === 'chatbot'
                    ? 'AI Chatbot'
                    : activePage === 'history'
                      ? 'Analysis History'
                      : activePage === 'recommendations'
                        ? 'Recommendations'
                        : 'My Profile'}
            </h2>

            <p>
              {activePage === 'dashboard'
                ? 'Monitor your farm with AI-powered insights'
                : 'Farm AI Advisory System'}
            </p>
          </div>

          <div className="fd-user">
            <div className="fd-avatar">
              {name.charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{name}</strong>
              <span>{email || 'Farmer'}</span>
            </div>

            <b>⌄</b>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}

export default FarmerDashboard