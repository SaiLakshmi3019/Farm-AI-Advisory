import { useState } from 'react'
import CropDetection from './CropDetection.jsx'
import Chatbot from './Chatbot.jsx'
import './FarmerDashboardV2.css'

const Icon = ({ name, size = 20 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    leaf: (
      <>
        <path d="M20.5 3.5C13.7 3.2 7.1 5.4 4.7 10.1c-2 3.9-.1 7.6 3.5 7.6 5.4 0 8.9-5.2 10.3-10.2" />
        <path d="M4 20c2.2-5.6 6.4-8.2 11.5-10.2" />
      </>
    ),
    chat: (
      <>
        <path d="M5 5.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4.5 3v-3.2A2.4 2.4 0 0 1 3 15V7.5a2 2 0 0 1 2-2Z" />
        <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" strokeWidth="2.5" />
      </>
    ),
    history: (
      <>
        <path d="M3 12a9 9 0 1 0 3-6.7" />
        <path d="M3 5v5h5" />
        <path d="M12 7v5l3.3 2" />
      </>
    ),
    bulb: (
      <>
        <path d="M9 18h6" />
        <path d="M10 21h4" />
        <path d="M8.1 14.8A7 7 0 1 1 15.9 14.8C14.9 15.8 14.3 16.6 14 18H10c-.3-1.4-.9-2.2-1.9-3.2Z" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3.2" />
        <path d="M5 20c.9-3.3 3.1-5 7-5s6.1 1.7 7 5" />
      </>
    ),
    home: (
      <>
        <path d="m3 10.5 9-7 9 7" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.5 20v-6h5v6" />
      </>
    ),
    logout: (
      <>
        <path d="M10 5H6.5A2.5 2.5 0 0 0 4 7.5v9A2.5 2.5 0 0 0 6.5 19H10" />
        <path d="M14 8l4 4-4 4" />
        <path d="M18 12H9" />
      </>
    ),
    scan: (
      <>
        <path d="M7 4H5a1 1 0 0 0-1 1v2" />
        <path d="M17 4h2a1 1 0 0 1 1 1v2" />
        <path d="M7 20H5a1 1 0 0 1-1-1v-2" />
        <path d="M17 20h2a1 1 0 0 0 1-1v-2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M9 12h6M12 9v6" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m7 15 3-3 2 2 5-6" />
      </>
    ),
    alert: (
      <>
        <path d="M12 3.5 21 19H3L12 3.5Z" />
        <path d="M12 9v4" />
        <path d="M12 16.5h.01" strokeWidth="2.8" />
      </>
    ),
    percent: (
      <>
        <path d="M7 17 17 7" />
        <circle cx="7.5" cy="7.5" r="2" />
        <circle cx="16.5" cy="16.5" r="2" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h13" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 7" />,
    sprout: (
      <>
        <path d="M12 21V10" />
        <path d="M12 12c-4.5 0-7-2.3-7-6 4.2 0 7 1.5 7 6Z" />
        <path d="M12 14c4.5 0 7-2.3 7-6-4.2 0-7 1.5-7 6Z" />
      </>
    ),
  }

  return <svg {...common}>{paths[name] || paths.dashboard}</svg>
}

const navItems = [
  ['dashboard', 'Dashboard', 'dashboard'],
  ['detection', 'Crop Detection', 'leaf'],
  ['chatbot', 'AI Chatbot', 'chat'],
  ['history', 'Analysis History', 'history'],
  ['recommendations', 'Recommendations', 'bulb'],
]

function FarmerDashboardV2({ farmer, onLogout, onHome }) {
  const [activePage, setActivePage] = useState('dashboard')
  const name = farmer?.name || 'Farmer'
  const email = farmer?.email || 'farmer@example.com'

  const goHome = () => {
    if (onHome) onHome()
    else window.location.reload()
  }

  const logout = () => {
    if (onLogout) onLogout()
    else window.location.reload()
  }

  const shell = (children) => (
    <div className="v2-app">
      <aside className="v2-sidebar">
        <div className="v2-brand">
          <div className="v2-brand-mark"><Icon name="leaf" size={27} /></div>
          <div>
            <strong>Farm AI</strong>
            <span>Advisory System</span>
          </div>
        </div>

        <nav className="v2-nav">
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              className={`v2-nav-item ${activePage === id ? 'active' : ''}`}
              onClick={() => setActivePage(id)}
            >
              <Icon name={icon} size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="v2-sidebar-bottom">
          <button
            className={`v2-nav-item ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => setActivePage('profile')}
          >
            <Icon name="user" size={20} />
            <span>My Profile</span>
          </button>

          <button className="v2-nav-item" onClick={goHome}>
            <Icon name="home" size={20} />
            <span>Back to Home</span>
          </button>

          <button className="v2-nav-item v2-logout" onClick={logout}>
            <Icon name="logout" size={20} />
            <span>Logout</span>
          </button>
        </div>

        <div className="v2-sidebar-footer">
          <div className="v2-footer-sprout"><Icon name="sprout" size={54} /></div>
          <strong>Healthy Crops</strong>
          <span>Better Tomorrow</span>
          <div className="v2-footer-line" />
        </div>
      </aside>

      <main className="v2-main">
        <header className="v2-topbar">
          <div>
            <div className="v2-eyebrow">FARM AI ADVISORY</div>
            <h1>
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
            </h1>
            <p>
              {activePage === 'dashboard'
                ? 'Monitor your farm with AI-powered insights'
                : 'Smart agricultural support for your farm'}
            </p>
          </div>

          <div className="v2-profile-chip">
            <div className="v2-avatar">{name.charAt(0).toUpperCase()}</div>
            <div>
              <strong>{name}</strong>
              <span>{email}</span>
            </div>
            <span className="v2-chevron">⌄</span>
          </div>
        </header>

        {children}
      </main>
    </div>
  )

  if (activePage === 'detection') {
    return shell(
      <section className="v2-page">
        <div className="v2-page-heading">
          <h2>Crop Detection</h2>
          <p>Upload a crop image for AI-powered disease analysis.</p>
        </div>
        <CropDetection farmer={farmer} />
      </section>
    )
  }

  if (activePage === 'chatbot') {
    return shell(<Chatbot onBack={() => setActivePage('dashboard')} />)
  }

  if (activePage === 'history') {
    return shell(
      <section className="v2-page">
        <div className="v2-page-heading">
          <h2>Analysis History</h2>
          <p>Review previous crop analysis results.</p>
        </div>

        <div className="v2-empty-card">
          <div className="v2-empty-icon"><Icon name="chart" size={30} /></div>
          <h3>No analysis yet</h3>
          <p>Upload your first crop image to build your analysis history.</p>
          <button className="v2-green-btn" onClick={() => setActivePage('detection')}>
            Start Crop Analysis <Icon name="arrow" size={18} />
          </button>
        </div>
      </section>
    )
  }

  if (activePage === 'recommendations') {
    return shell(
      <section className="v2-page">
        <div className="v2-page-heading">
          <h2>Recommendations</h2>
          <p>Smart agricultural guidance for healthier crops.</p>
        </div>

        <div className="v2-recommend-page">
          <div className="v2-recommend-visual">
            <div className="v2-orbit v2-orbit-one" />
            <div className="v2-orbit v2-orbit-two" />
            <Icon name="sprout" size={82} />
          </div>
          <div className="v2-recommend-copy">
            <span className="v2-soft-label">AI-POWERED GUIDANCE</span>
            <h3>Personalized recommendations start with a crop image.</h3>
            <p>
              Detect crop conditions, review confidence, and use practical
              next-step guidance to support better farm decisions.
            </p>
            <button className="v2-green-btn" onClick={() => setActivePage('detection')}>
              Analyze a Crop <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </section>
    )
  }

  if (activePage === 'profile') {
    return shell(
      <section className="v2-page">
        <div className="v2-page-heading">
          <h2>My Profile</h2>
          <p>Your farmer account information.</p>
        </div>

        <div className="v2-profile-card">
          <div className="v2-profile-avatar-large">{name.charAt(0).toUpperCase()}</div>
          <div>
            <span className="v2-soft-label">FARMER ACCOUNT</span>
            <h3>{name}</h3>
            <p>{email}</p>
            <div className="v2-profile-badge"><Icon name="check" size={15} /> Account active</div>
          </div>
        </div>
      </section>
    )
  }

  return shell(
    <section className="v2-dashboard">
      <section className="v2-hero">
        <img
          src="/Farm-AI-Advisory/images/farm-dashboard-hero.svg"
          alt="Smart farm with healthy crop"
          className="v2-hero-image"
        />
        <div className="v2-hero-overlay">
          <div className="v2-hero-copy">
            <div className="v2-hero-kicker">
              SMART FARMING <span>•</span> BETTER YIELDS <span>•</span> SUSTAINABLE FUTURE
            </div>
            <h2>Healthy Crops, Brighter Future</h2>
            <p>
              Use AI to detect diseases, get expert recommendations
              <br className="desktop-only" />
              and make better decisions for your farm.
            </p>
            <button className="v2-hero-btn" onClick={() => setActivePage('detection')}>
              Start Crop Analysis <Icon name="arrow" size={19} />
            </button>
          </div>
        </div>
      </section>

      <section className="v2-stats">
        <StatCard icon="scan" title="Total Analyses" value="0" note="AI crop scans" />
        <StatCard icon="leaf" title="Healthy Crops" value="0" note="Healthy results" />
        <StatCard icon="alert" title="Diseases Found" value="0" note="Needs attention" danger />
        <StatCard icon="percent" title="Avg. Confidence" value="0%" note="AI confidence" />
      </section>

      <section className="v2-two-col">
        <div className="v2-card">
          <div className="v2-card-head">
            <div>
              <h3>Recent Analysis</h3>
              <p>Your latest crop health results</p>
            </div>
            <button className="v2-text-btn" onClick={() => setActivePage('history')}>
              View All <Icon name="arrow" size={17} />
            </button>
          </div>

          <div className="v2-analysis-empty">
            <div className="v2-analysis-icon"><Icon name="leaf" size={34} /></div>
            <h4>No analysis yet</h4>
            <p>Upload your first crop image to begin.</p>
          </div>
        </div>

        <div className="v2-card">
          <div className="v2-card-head">
            <div>
              <h3>AI Recommendations</h3>
              <p>Smart farming guidance</p>
            </div>
          </div>

          <div className="v2-rec-body">
            <div className="v2-rec-icon"><Icon name="sprout" size={28} /></div>
            <div>
              <h4>Get personalized recommendations</h4>
              <p>Analyze a crop to receive practical guidance for healthier plants.</p>
              <button className="v2-green-btn compact" onClick={() => setActivePage('detection')}>
                Start Analysis <Icon name="arrow" size={17} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-card v2-quick-card">
        <div className="v2-card-head">
          <div>
            <h3>Quick Actions</h3>
            <p>Access important features quickly</p>
          </div>
          <span className="v2-mini-brand"><Icon name="leaf" size={18} /></span>
        </div>

        <div className="v2-quick-grid">
          <QuickAction icon="scan" tone="green" title="Crop Detection" text="Analyze a crop image" onClick={() => setActivePage('detection')} />
          <QuickAction icon="chat" tone="blue" title="AI Chatbot" text="Ask farming questions" onClick={() => setActivePage('chatbot')} />
          <QuickAction icon="history" tone="purple" title="Analysis History" text="View previous results" onClick={() => setActivePage('history')} />
          <QuickAction icon="bulb" tone="orange" title="Recommendations" text="Get expert advice" onClick={() => setActivePage('recommendations')} />
        </div>
      </section>

      <section className="v2-bottom-banner">
        <div className="v2-bottom-art">
          <div className="v2-bottom-sun" />
          <div className="v2-bottom-hill hill-one" />
          <div className="v2-bottom-hill hill-two" />
          <div className="v2-bottom-row row-one" />
          <div className="v2-bottom-row row-two" />
          <div className="v2-bottom-plant"><Icon name="sprout" size={78} /></div>
        </div>

        <div className="v2-bottom-copy">
          <span className="v2-soft-label">FARM AI • EVERYDAY SUPPORT</span>
          <h3>From crop image to clear action.</h3>
          <p>
            Scan a crop, understand the result, and move forward with a
            practical recommendation designed for farm-friendly decisions.
          </p>

          <div className="v2-step-row">
            <Step number="01" title="Scan" text="Upload" />
            <Step number="02" title="Understand" text="AI result" />
            <Step number="03" title="Act" text="Guidance" />
          </div>
        </div>
      </section>
    </section>
  )
}

function StatCard({ icon, title, value, note, danger = false }) {
  return (
    <div className="v2-stat-card">
      <div className={`v2-stat-icon ${danger ? 'danger' : ''}`}>
        <Icon name={icon} size={25} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </div>
  )
}

function QuickAction({ icon, tone, title, text, onClick }) {
  return (
    <button className={`v2-quick-item ${tone}`} onClick={onClick}>
      <span className="v2-quick-icon"><Icon name={icon} size={22} /></span>
      <span className="v2-quick-text">
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <Icon name="arrow" size={17} />
    </button>
  )
}

function Step({ number, title, text }) {
  return (
    <div className="v2-step">
      <span>{number}</span>
      <strong>{title}</strong>
      <small>{text}</small>
    </div>
  )
}

export default FarmerDashboardV2

