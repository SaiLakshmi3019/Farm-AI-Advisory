import { useEffect, useState } from 'react'
import Chatbot from './Chatbot.jsx'
import CropDetection from './CropDetection.jsx'

const ACTIVITY_TYPES = ['Scouting', 'Irrigation', 'Planting', 'Fertilizing', 'Pruning', 'Harvest', 'Other']
const PLANNER_TYPES = ['Field inspection', 'Watering', 'Planting', 'Fertilizing', 'Pest monitoring', 'Harvest', 'Other']

function readSavedList(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function writeSavedList(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    return false
  }
  return true
}

function localDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function displayDate(date) {
  if (!date) return 'Date not set'
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function confidencePercent(value) {
  const confidence = Number(value || 0)
  return confidence > 0 && confidence <= 1 ? confidence * 100 : confidence
}


function DashboardWeather() {
  const [region, setRegion] = useState(
    localStorage.getItem('farm_ai_region') || 'Ongole, Andhra Pradesh'
  )

  const [location, setLocation] = useState(null)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const weatherText = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Moderate showers',
    82: 'Heavy showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Thunderstorm with heavy hail',
  }

  const weatherIcon = (code) => {
    if (code === 0) return '☀️'
    if (code === 1 || code === 2) return '🌤️'
    if (code === 3) return '☁️'
    if (code === 45 || code === 48) return '🌫️'
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️'
    if ([71, 73, 75].includes(code)) return '❄️'
    if ([95, 96, 99].includes(code)) return '⛈️'
    return '🌤️'
  }

  async function getWeather(searchRegion) {
    const query = String(searchRegion || '').trim()

    if (!query) {
      setError('Please enter a city, district or region.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query,
        )}&count=1&language=en&format=json`,
      )

      if (!geoResponse.ok) {
        throw new Error('Region search failed.')
      }

      const geoData = await geoResponse.json()

      if (!geoData.results?.length) {
        throw new Error('Region not found. Try another city or district.')
      }

      const place = geoData.results[0]

      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${place.latitude}` +
          `&longitude=${place.longitude}` +
          `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
          `&forecast_days=7` +
          `&timezone=auto`,
      )

      const weatherData = await weatherResponse.json().catch(() => ({}))

      if (!weatherResponse.ok) {
        throw new Error(
          weatherData?.reason || 'Weather service failed.',
        )
      }

      setLocation(place)
      setWeather(weatherData)
      setRegion(query)

      localStorage.setItem('farm_ai_region', query)
    } catch (err) {
      setLocation(null)
      setWeather(null)
      setError(err?.message || 'Unable to load weather.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getWeather(
      localStorage.getItem('farm_ai_region') ||
        'Ongole, Andhra Pradesh',
    )
  }, [])

  return (
    <section
      style={{
        background: '#ffffff',
        border: '1px solid #dfeae4',
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        boxShadow: '0 8px 24px rgba(20,70,48,0.04)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 18,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <div
            style={{
              color: '#6f9b87',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            LOCATION & WEATHER
          </div>

          <h2
            style={{
              margin: '6px 0 4px',
              color: '#173d2e',
              fontSize: 22,
            }}
          >
            Farm Weather Forecast
          </h2>

          <p
            style={{
              margin: 0,
              color: '#7d8d86',
              fontSize: 13,
            }}
          >
            Current conditions and the next 7 days for your region.
          </p>
        </div>

        {location && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: '#eff8f3',
              border: '1px solid #dcece3',
              color: '#197651',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            📍 {location.name}
            {location.admin1 ? `, ${location.admin1}` : ''}
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 10,
          marginBottom: 18,
        }}
      >
        <input
          type="text"
          value={region}
          onChange={(event) => setRegion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              getWeather(event.target.value)
            }
          }}
          placeholder="Enter city, district or region"
          aria-label="Farm region"
          style={{
            flex: 1,
            minWidth: 0,
            height: 45,
            border: '1px solid #d6e5dc',
            borderRadius: 11,
            padding: '0 14px',
            outline: 'none',
            color: '#254a3a',
            background: '#fbfdfc',
            boxSizing: 'border-box',
            fontSize: 13,
          }}
        />

        <button
          type="button"
          onClick={() => getWeather(region)}
          disabled={loading}
          style={{
            border: 0,
            borderRadius: 11,
            padding: '0 17px',
            background: '#177b53',
            color: '#ffffff',
            fontWeight: 800,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.65 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? 'Loading...' : 'Get Weather'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 10,
            background: '#fff2ee',
            color: '#b94f39',
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      {weather?.current && weather?.daily && location && (
        <>
          <div
            style={{
              padding: 20,
              borderRadius: 16,
              background:
                'linear-gradient(135deg,#edf8f2,#f8fbf9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 18,
                  display: 'grid',
                  placeItems: 'center',
                  background: '#ffffff',
                  fontSize: 35,
                  flexShrink: 0,
                }}
              >
                {weatherIcon(weather.current.weather_code)}
              </div>

              <div>
                <div
                  style={{
                    color: '#21493a',
                    fontSize: 18,
                    fontWeight: 850,
                  }}
                >
                  {location.name}
                  {location.admin1 ? `, ${location.admin1}` : ''}
                </div>

                <div
                  style={{
                    marginTop: 3,
                    color: '#7b8c84',
                    fontSize: 12,
                  }}
                >
                  {weatherText[weather.current.weather_code] ||
                    'Weather'}
                </div>

                <strong
                  style={{
                    display: 'block',
                    marginTop: 7,
                    color: '#173d2e',
                    fontSize: 30,
                  }}
                >
                  {Math.round(weather.current.temperature_2m)}°C
                </strong>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(2,minmax(110px,1fr))',
                gap: 10,
              }}
            >
              {[
                [
                  'Feels like',
                  `${Math.round(
                    weather.current.apparent_temperature,
                  )}°C`,
                ],
                [
                  'Humidity',
                  `${weather.current.relative_humidity_2m}%`,
                ],
                [
                  'Rain now',
                  `${weather.current.precipitation ?? 0} mm`,
                ],
                [
                  'Wind',
                  `${Math.round(
                    weather.current.wind_speed_10m,
                  )} km/h`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    minWidth: 110,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#ffffff',
                    border: '1px solid #e5eee9',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#83928b',
                      fontSize: 10,
                    }}
                  >
                    {label}
                  </span>

                  <b
                    style={{
                      display: 'block',
                      marginTop: 3,
                      color: '#284b3d',
                      fontSize: 13,
                    }}
                  >
                    {value}
                  </b>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              marginBottom: 11,
              color: '#284b3d',
              fontSize: 15,
              fontWeight: 850,
            }}
          >
            7-Day Forecast
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(7,minmax(90px,1fr))',
              gap: 9,
              overflowX: 'auto',
            }}
          >
            {weather.daily.time.map((date, index) => (
              <div
                key={date}
                style={{
                  minWidth: 90,
                  padding: '13px 8px',
                  textAlign: 'center',
                  border: '1px solid #e2ece6',
                  borderRadius: 13,
                  background: '#fcfefd',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    color: '#557066',
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {index === 0
                    ? 'Today'
                    : new Date(
                        `${date}T12:00:00`,
                      ).toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                </span>

                <div
                  style={{
                    margin: '9px 0 5px',
                    fontSize: 25,
                  }}
                >
                  {weatherIcon(
                    weather.daily.weather_code[index],
                  )}
                </div>

                <span
                  style={{
                    display: 'block',
                    minHeight: 28,
                    color: '#89968f',
                    fontSize: 9,
                    lineHeight: 1.3,
                  }}
                >
                  {weatherText[
                    weather.daily.weather_code[index]
                  ] || 'Weather'}
                </span>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 7,
                  }}
                >
                  <b
                    style={{
                      color: '#284b3d',
                      fontSize: 13,
                    }}
                  >
                    {Math.round(
                      weather.daily.temperature_2m_max[index],
                    )}
                    °
                  </b>

                  <span
                    style={{
                      color: '#98a39e',
                      fontSize: 12,
                    }}
                  >
                    {Math.round(
                      weather.daily.temperature_2m_min[index],
                    )}
                    °
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 7,
                    color: '#4b87a2',
                    fontSize: 9,
                  }}
                >
                  Rain{' '}
                  {weather.daily
                    .precipitation_probability_max[index] ?? 0}
                  %
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function DashboardOverview({ history, setActivePage, name, Icon }) {
  const healthy = history.filter((item) => item.disease?.toLowerCase().includes('healthy')).length
  const issues = history.length - healthy
  const averageConfidence = history.length
    ? Math.round(history.reduce((total, item) => total + confidencePercent(item.confidence), 0) / history.length)
    : 0
  const recent = history.slice(0, 3)
  const metrics = [
    ['scan', history.length, 'Total Analyses', 'Saved image screenings', 'green'],
    ['leaf', healthy, 'Healthy Crops', 'Classified as healthy', 'mint'],
    ['alert', issues, 'Issues Found', 'Review field conditions', 'amber'],
    ['percent', `${averageConfidence}%`, 'Avg. Confidence', 'Model score, not severity', 'violet'],
  ]
  const quickActions = [
    ['scan', 'Crop Detection', 'Upload & analyze', 'detection'],
    ['chat', 'AI Chatbot', 'Ask farming questions', 'chatbot'],
    ['report', 'Reports', 'Download field reports', 'reports'],
    ['activity', 'Farm Activities', 'Log work in the field', 'activities'],
    ['calendar', 'Crop Calendar', 'Plan upcoming work', 'planner'],
  ]

  return (
    <div className="workspace-overview">
      <section className="workspace-hero">
        <div className="workspace-hero-copy">
          <span>FARM MONITORING · {name.toUpperCase()}</span>
          <h2>Healthy Crops,<br /><strong>Brighter Future</strong></h2>
          <p>Screen supported crops, review saved observations, and organize the work ahead.</p>
          <button type="button" onClick={() => setActivePage('detection')}>
            <Icon name="scan" size={17} /> Start Crop Analysis <Icon name="arrow" size={15} />
          </button>
        </div>
        <div className="workspace-hero-signals" aria-label="Farm AI tools">
          <span><Icon name="leaf" size={18} /> Crop screening</span>
          <span><Icon name="bulb" size={18} /> Field guidance</span>
          <span><Icon name="calendar" size={18} /> Activity planning</span>
        </div>
      </section>

      <DashboardWeather />

      <section className="workspace-metrics" aria-label="Farm analysis summary">
        {metrics.map(([icon, value, label, helper, tone]) => (
          <article className={`workspace-metric ${tone}`} key={label}>
            <div className="workspace-metric-icon"><Icon name={icon} size={20} /></div>
            <div className="workspace-metric-copy">
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{helper}</small>
            </div>
          </article>
        ))}
      </section>

      <div className="workspace-home-grid">
        <section className="workspace-panel">
          <header className="workspace-panel-heading">
            <div><span>FIELD RECORD</span><h3>Recent Analysis</h3></div>
            <button type="button" onClick={() => setActivePage('history')}>View all <Icon name="arrow" size={14} /></button>
          </header>
          {recent.length ? (
            <div className="workspace-recent-list">
              {recent.map((item) => {
                const crop = (item.crop_type || '').toLowerCase()
                const image = ['tomato', 'potato', 'pepper', 'corn', 'grape', 'strawberry'].find((name) => crop.includes(name))
                return (
                  <article className="workspace-recent-row" key={item.id}>
                    {image ? <img src={`/images/${image}.jpg`} alt={`${item.crop_type} crop`} /> : <div className="workspace-recent-placeholder"><Icon name="leaf" size={20} /></div>}
                    <div className="workspace-recent-content">
                      <strong>{item.crop_type || 'Unknown crop'}</strong>
                      <span>{item.disease || 'Unclassified condition'}</span>
                      <small>{item.created_at ? new Date(`${item.created_at}Z`).toLocaleString() : 'Saved analysis'}</small>
                    </div>
                    <button type="button" aria-label={`Open report for ${item.crop_type || 'crop'}`} onClick={() => setActivePage('reports')}>View report <Icon name="arrow" size={13} /></button>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="workspace-empty-inline">
              <Icon name="scan" size={22} />
              <div><strong>No crop scans yet</strong><span>Your completed image screenings will appear here.</span></div>
              <button type="button" onClick={() => setActivePage('detection')}>Start a scan</button>
            </div>
          )}
        </section>

        <section className="workspace-panel workspace-advisory-panel">
          <header className="workspace-panel-heading">
            <div><span>ADVISORY</span><h3>Latest Field Guidance</h3></div>
            <Icon name="bulb" size={21} />
          </header>
          {recent[0]?.recommendation ? (
            <div className="workspace-guidance">
              <strong>{recent[0].disease?.toLowerCase().includes('healthy') ? 'Continue regular monitoring' : `Review ${recent[0].disease} symptoms`}</strong>
              <p>{recent[0].recommendation}</p>
              <button type="button" onClick={() => setActivePage('reports')}>Open latest report <Icon name="arrow" size={14} /></button>
            </div>
          ) : (
            <div className="workspace-guidance">
              <strong>Start with a clear crop image</strong>
              <p>Your latest scan guidance will appear here. AI image results are screening support; confirm important treatment decisions locally.</p>
              <button type="button" onClick={() => setActivePage('detection')}>Analyze a crop <Icon name="arrow" size={14} /></button>
            </div>
          )}
          <div className="workspace-guidance-tags"><span>Crop health</span><span>Field notes</span><span>Season planning</span></div>
        </section>
      </div>

      <section className="workspace-quick-actions">
        <header className="workspace-panel-heading">
          <div><span>YOUR WORKSPACE</span><h3>Quick Actions</h3></div>
        </header>
        <div className="workspace-action-grid">
          {quickActions.map(([icon, title, description, page]) => (
            <button type="button" className="workspace-action" key={page} onClick={() => setActivePage(page)}>
              <span><Icon name={icon} size={19} /></span>
              <strong>{title}</strong>
              <small>{description}</small>
              <Icon name="arrow" size={14} />
            </button>
          ))}
        </div>
      </section>

      <footer className="workspace-footer-banner">
        <Icon name="leaf" size={23} />
        <div><strong>Smarter Farming for a Greener Tomorrow</strong><span>Field records · Crop insights · Better decisions</span></div>
        <button type="button" aria-label="Open crop calendar" onClick={() => setActivePage('planner')}><Icon name="calendar" size={19} /></button>
      </footer>
    </div>
  )
}

function ReportsPage({ history, farmerName, onDownload }) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const filtered = history.filter((item) => {
    const matchesQuery = `${item.crop_type || ''} ${item.disease || ''}`.toLowerCase().includes(query.toLowerCase())
    const isHealthy = item.disease?.toLowerCase().includes('healthy')
    return matchesQuery && (filter === 'all' || (filter === 'healthy' ? isHealthy : !isHealthy))
  })

  return (
    <section className="farm-tool-page">
      <header className="farm-tool-heading"><div><span>REPORT MANAGEMENT</span><h2>Farmer advisory reports</h2><p>Search saved image analyses and download a farmer-friendly PDF.</p></div><strong>{history.length} saved</strong></header>
      <div className="report-controls">
        <label className="report-search"><span>Find a report</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search crop or condition" /></label>
        <div className="report-filter" aria-label="Filter reports">
          {[['all', 'All reports'], ['issue', 'Issues'], ['healthy', 'Healthy']].map(([value, label]) => <button type="button" key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}
        </div>
      </div>
      {filtered.length ? (
        <div className="report-list">
          {filtered.map((item) => (
            <article className="report-row" key={item.id}>
              <div className="report-row-mark">{item.disease?.toLowerCase().includes('healthy') ? 'OK' : 'AI'}</div>
              <div className="report-row-main"><strong>{item.crop_type || 'Unknown crop'} · {item.disease || 'Unclassified'}</strong><span>{item.created_at ? new Date(`${item.created_at}Z`).toLocaleString() : 'Date unavailable'} · {confidencePercent(item.confidence).toFixed(1)}% model score</span></div>
              <span className="report-severity">{item.severity || 'Needs field assessment'}</span>
              <button type="button" className="report-download" onClick={() => onDownload(item, farmerName)}>Download PDF <span aria-hidden="true">↓</span></button>
            </article>
          ))}
        </div>
      ) : (
        <div className="farm-empty-state"><strong>{history.length ? 'No reports match this search' : 'No saved reports yet'}</strong><span>{history.length ? 'Change your search or report filter.' : 'Complete a crop scan to create your first advisory report.'}</span></div>
      )}
      <p className="farm-tool-note">Reports summarize image screening results. They do not replace a field inspection or locally qualified agricultural advice.</p>
    </section>
  )
}

function FarmActivityPage({ activities, setActivities }) {
  const [draft, setDraft] = useState({ crop: '', type: 'Scouting', date: localDateString(), notes: '' })
  const [error, setError] = useState('')
  const addActivity = (event) => {
    event.preventDefault()
    if (!draft.crop.trim()) {
      setError('Add a crop or field name for this activity.')
      return
    }
    setActivities((current) => [{ ...draft, crop: draft.crop.trim(), notes: draft.notes.trim(), id: `${Date.now()}-${Math.random()}` }, ...current])
    setDraft({ crop: '', type: 'Scouting', date: localDateString(), notes: '' })
    setError('')
  }

  return (
    <section className="farm-tool-page">
      <header className="farm-tool-heading"><div><span>FIELD JOURNAL</span><h2>Farm activity log</h2><p>Keep a dated record of work completed in each crop or field.</p></div><strong>{activities.length} entries</strong></header>
      <form className="farm-entry-form" onSubmit={addActivity}>
        <label>Crop or field<input value={draft.crop} onChange={(event) => setDraft({ ...draft, crop: event.target.value })} placeholder="e.g. North tomato plot" /></label>
        <label>Activity<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{ACTIVITY_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
        <label>Date<input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label>
        <label className="farm-entry-notes">Notes<input value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="What did you observe or do?" /></label>
        <button type="submit" className="farm-primary-button">Add activity</button>
        {error && <span className="farm-form-error" role="alert">{error}</span>}
      </form>
      <div className="farm-activity-list">
        {activities.length ? activities.map((item) => (
          <article className="farm-activity-row" key={item.id}>
            <span className="farm-activity-date">{displayDate(item.date)}</span>
            <div><strong>{item.crop}</strong><span>{item.type}{item.notes ? ` · ${item.notes}` : ''}</span></div>
            <button type="button" className="farm-remove-button" aria-label={`Remove ${item.type} entry for ${item.crop}`} onClick={() => setActivities((current) => current.filter((activity) => activity.id !== item.id))}>Remove</button>
          </article>
        )) : <div className="farm-empty-state"><strong>Your field journal is ready</strong><span>Add irrigation, scouting, planting, harvest, and other completed work.</span></div>}
      </div>
    </section>
  )
}

function CropCalendarPage({ events, setEvents }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(localDateString())
  const [draft, setDraft] = useState({ crop: '', type: 'Field inspection', date: localDateString(), notes: '' })
  const [error, setError] = useState('')
  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const monthLabel = month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstWeekday = new Date(year, monthIndex, 1).getDay()
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, monthIndex, index - firstWeekday + 1)
    return { date, key: localDateString(date), inMonth: date.getMonth() === monthIndex }
  })
  const selectedEvents = events.filter((event) => event.date === selectedDate).sort((a, b) => a.date.localeCompare(b.date))
  const setMonthOffset = (offset) => setMonth(new Date(year, monthIndex + offset, 1))
  const addEvent = (event) => {
    event.preventDefault()
    if (!draft.crop.trim()) {
      setError('Add a crop or field name before saving the plan.')
      return
    }
    setEvents((current) => [...current, { ...draft, crop: draft.crop.trim(), notes: draft.notes.trim(), id: `${Date.now()}-${Math.random()}` }].sort((a, b) => a.date.localeCompare(b.date)))
    setSelectedDate(draft.date)
    setDraft({ ...draft, crop: '', notes: '' })
    setError('')
  }

  return (
    <section className="farm-tool-page">
      <header className="farm-tool-heading"><div><span>SEASON PLANNER</span><h2>Crop calendar & activity planner</h2><p>Schedule field work and review the plan for each date.</p></div><strong>{events.length} planned</strong></header>
      <div className="planner-layout">
        <section className="planner-calendar" aria-label={`Calendar for ${monthLabel}`}>
          <header><button type="button" aria-label="Previous month" onClick={() => setMonthOffset(-1)}>‹</button><h3>{monthLabel}</h3><button type="button" aria-label="Next month" onClick={() => setMonthOffset(1)}>›</button></header>
          <div className="planner-weekdays">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="planner-days">
            {calendarDays.map(({ date, key, inMonth }) => {
              const count = events.filter((event) => event.date === key).length
              return <button type="button" key={key} className={`${inMonth ? '' : 'outside'} ${selectedDate === key ? 'selected' : ''}`} onClick={() => { setSelectedDate(key); setDraft((current) => ({ ...current, date: key })) }}><span>{date.getDate()}</span>{count > 0 && <i aria-label={`${count} planned activities`}>{count > 3 ? '3+' : count}</i>}</button>
            })}
          </div>
        </section>
        <section className="planner-side">
          <div className="planner-selected-date"><span>SELECTED DATE</span><strong>{displayDate(selectedDate)}</strong></div>
          <form className="planner-form" onSubmit={addEvent}>
            <label>Crop or field<input value={draft.crop} onChange={(event) => setDraft({ ...draft, crop: event.target.value })} placeholder="e.g. East potato plot" /></label>
            <label>Planned activity<select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })}>{PLANNER_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label>Date<input type="date" value={draft.date} onChange={(event) => { setDraft({ ...draft, date: event.target.value }); setSelectedDate(event.target.value) }} /></label>
            <label>Notes<input value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Optional reminder" /></label>
            <button type="submit" className="farm-primary-button">Add to calendar</button>
            {error && <span className="farm-form-error" role="alert">{error}</span>}
          </form>
          <div className="planner-event-list">
            <h3>Planned for this day</h3>
            {selectedEvents.length ? selectedEvents.map((event) => <article className="planner-event" key={event.id}><div><strong>{event.type} · {event.crop}</strong><span>{event.notes || 'No extra notes'}</span></div><button type="button" aria-label={`Remove ${event.type} for ${event.crop}`} onClick={() => setEvents((current) => current.filter((item) => item.id !== event.id))}>×</button></article>) : <p>No activities planned for this date.</p>}
          </div>
        </section>
      </div>
      <p className="farm-tool-note">Calendar items are saved in this browser for the current farmer account. Check local growing conditions before scheduling treatments.</p>
    </section>
  )
}

function WorkspaceIcon({ name, size = 18 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v12h14V9M9 21v-7h6v7" /></>,
    scan: <><path d="M7 3H5a2 2 0 0 0-2 2v2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /><circle cx="12" cy="12" r="3" /></>,
    chat: <><path d="M4 5h16v12H9l-5 4z" /><path d="M8 10h8M8 13h5" /></>,
    report: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 12h6M9 16h6" /></>,
    activity: <><path d="M5 4h14v17H5zM9 4V2h6v2M8 10h8M8 14h4M8 18h7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 5v5h5M12 7v5l3 2" /></>,
    bulb: <><path d="M9 18h6M10 21h4M8 15a7 7 0 1 1 8 0c-1 1-1.5 2-1.8 3h-4.4c-.3-1-.8-2-1.8-3Z" /></>,
    leaf: <><path d="M20 4C12 4 6 8 6 14c0 3 2 5 5 5 6 0 9-7 9-15Z" /><path d="M4 20c3-4 6-7 12-11" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    logout: <><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M14 8l4 4-4 4M18 12H9" /></>,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21c1-4 3-6 7-6s6 2 7 6" /></>,
    alert: <><path d="m12 3 9 17H3zM12 9v5M12 17h.01" /></>,
    percent: <><path d="M7 17 17 7" /><circle cx="7.5" cy="7.5" r="2" /><circle cx="16.5" cy="16.5" r="2" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.leaf}</svg>
}

function AnalysisHistoryPage({ history, loading, error, onReports }) {
  return (
    <section className="farm-tool-page">
      <header className="farm-tool-heading"><div><span>FIELD RECORD</span><h2>Analysis history</h2><p>Review saved crop screenings and compare observations over time.</p></div><button type="button" className="farm-primary-button" onClick={onReports}>Manage reports</button></header>
      {loading ? <div className="farm-empty-state">Loading saved analyses...</div> : error ? <div className="farm-empty-state error" role="alert">{error}</div> : history.length ? (
        <div className="report-list">
          {history.map((item) => <article className="report-row" key={item.id}><div className="report-row-mark"><WorkspaceIcon name="leaf" size={17} /></div><div className="report-row-main"><strong>{item.crop_type || 'Unknown crop'} · {item.disease || 'Unclassified'}</strong><span>{item.created_at ? new Date(`${item.created_at}Z`).toLocaleString() : 'Date unavailable'} · {confidencePercent(item.confidence).toFixed(1)}% model score</span></div><span className="report-severity">{item.severity || 'Needs field assessment'}</span></article>)}
          <p className="farm-tool-note">Confidence history is not a measure of disease progression. Compare symptoms on the plants themselves.</p>
        </div>
      ) : <div className="farm-empty-state"><strong>No analysis history yet</strong><span>Completed crop screenings appear here automatically.</span></div>}
    </section>
  )
}

function RecommendationPage({ history, setActivePage }) {
  const latest = history[0]
  return (
    <section className="farm-tool-page">
      <header className="farm-tool-heading"><div><span>FIELD GUIDANCE</span><h2>Recommendations</h2><p>Practical next steps based on saved crop screenings.</p></div></header>
      {latest?.recommendation ? <article className="recommendation-detail"><span>{latest.crop_type} · {latest.disease}</span><h3>{latest.disease?.toLowerCase().includes('healthy') ? 'Keep monitoring crop health' : 'Review these field actions'}</h3><p>{latest.recommendation}</p><button type="button" className="farm-primary-button" onClick={() => setActivePage('reports')}>Open advisory report</button></article> : <div className="farm-empty-state"><strong>No scan-based guidance yet</strong><span>Complete a crop scan to see condition-specific next steps.</span><button type="button" className="farm-primary-button" onClick={() => setActivePage('detection')}>Start crop analysis</button></div>}
      <p className="farm-tool-note">AI guidance is a screening aid. Confirm important treatment decisions with a qualified local agricultural adviser.</p>
    </section>
  )
}

function FarmWorkspace({ farmer, onLogout, onHome }) {
  const farmerId = farmer?.farmer_id || farmer?.id || farmer?.user_id || 1
  const name = farmer?.name || 'Farmer'
  const activityKey = `farm-ai-activities-${farmerId}`
  const plannerKey = `farm-ai-planner-${farmerId}`
  const [activePage, setActivePage] = useState('dashboard')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [historyError, setHistoryError] = useState('')
  const [activities, setActivities] = useState(() => readSavedList(activityKey))
  const [events, setEvents] = useState(() => readSavedList(plannerKey))
  const [reportError, setReportError] = useState('')

  useEffect(() => { writeSavedList(activityKey, activities) }, [activityKey, activities])
  useEffect(() => { writeSavedList(plannerKey, events) }, [plannerKey, events])

  useEffect(() => {
    if (!['dashboard', 'history', 'reports', 'recommendations'].includes(activePage)) return undefined
    let active = true
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/detection/history/${farmerId}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.detail || 'Could not load saved crop analyses.')
        return data.history || []
      })
      .then((items) => { if (active) { setHistory(items); setHistoryError('') } })
      .catch((requestError) => { if (active) setHistoryError(requestError.message || 'Could not connect to the farm service.') })
      .finally(() => { if (active) setHistoryLoading(false) })
    return () => { active = false }
  }, [activePage, farmerId])

  const downloadReport = async (record, farmerName) => {
    setReportError('')
    try {
      const { jsPDF } = await import('jspdf')
      const report = new jsPDF()
      const pageWidth = report.internal.pageSize.getWidth()
      report.setFillColor(19, 63, 45)
      report.rect(0, 0, pageWidth, 38, 'F')
      report.setTextColor(255, 255, 255)
      report.setFontSize(18)
      report.text('Farm AI Advisory Report', 16, 19)
      report.setFontSize(9)
      report.text('IMAGE SCREENING · FIELD VERIFICATION REQUIRED', 16, 28)
      report.setTextColor(28, 52, 40)
      report.setFontSize(11)
      report.text(`Prepared for: ${farmerName || 'Farmer'}`, 16, 52)
      report.text(`Report date: ${new Date().toLocaleDateString()}`, 16, 60)
      let y = 78
      const section = (heading, value) => {
        report.setFont('helvetica', 'bold')
        report.setFontSize(11)
        report.text(heading, 16, y)
        y += 7
        report.setFont('helvetica', 'normal')
        report.setFontSize(10)
        const lines = report.splitTextToSize(String(value || 'Not available'), pageWidth - 32)
        report.text(lines, 16, y)
        y += lines.length * 5 + 9
        if (y > 260) { report.addPage(); y = 22 }
      }
      section('Crop', record.crop_type || 'Unknown')
      section('Likely condition', record.disease || 'Not identified')
      section('Model confidence', `${confidencePercent(record.confidence).toFixed(1)}% (ranking score, not disease severity)`)
      section('Severity', record.severity || 'Needs field assessment')
      section('Recommended next steps', record.recommendation || 'Inspect the crop and consult a local agricultural adviser.')
      section('Important', 'This AI image screening is not a confirmed diagnosis. Verify symptoms with a qualified local agricultural adviser. Use only products registered for the crop in your area and follow their labels.')
      report.setTextColor(95, 112, 101)
      report.setFontSize(8)
      report.text(`Analysis ID: ${record.id ?? 'Not available'}`, 16, 282)
      report.save(`Farm-AI-report-${record.id ?? 'analysis'}.pdf`)
    } catch (error) {
      setReportError(error.message || 'Could not generate this report.')
    }
  }

  const navItems = [
    ['dashboard', 'Dashboard', 'home'], ['detection', 'Crop Detection', 'scan'],
    ['chatbot', 'AI Chatbot', 'chat'], ['reports', 'Report Management', 'report'],
    ['activities', 'Farm Activities', 'activity'], ['planner', 'Crop Calendar', 'calendar'],
    ['history', 'Analysis History', 'history'], ['recommendations', 'Recommendations', 'bulb'],
  ]
  const pageTitle = navItems.find(([id]) => id === activePage)?.[1] || 'Dashboard'

  return (
    <div className="farm-workspace">
      <aside className="farm-sidebar">
        <div className="farm-sidebar-brand"><span><WorkspaceIcon name="leaf" size={22} /></span><div><strong>Farm AI</strong><small>Advisory System</small></div></div>
        <span className="farm-sidebar-label">FARM WORKSPACE</span>
        <nav className="farm-sidebar-nav" aria-label="Farm workspace">
          {navItems.map(([id, label, icon]) => <button type="button" key={id} className={activePage === id ? 'active' : ''} onClick={() => setActivePage(id)}><WorkspaceIcon name={icon} size={17} /><span>{label}</span></button>)}
        </nav>
        <div className="farm-sidebar-bottom"><div className="farm-sidebar-motto"><WorkspaceIcon name="leaf" size={27} /><strong>Healthy Crops<br />Better Tomorrow</strong></div><button type="button" onClick={onHome}><WorkspaceIcon name="home" size={17} />Back to Home</button><button type="button" className="farm-logout" onClick={onLogout}><WorkspaceIcon name="logout" size={17} />Logout</button></div>
      </aside>

      <main className="farm-main">
        <header className="farm-topbar">
          <div><span>WELCOME BACK,</span><h1>{name} <WorkspaceIcon name="leaf" size={20} /></h1><p>Monitor, detect, and get expert advice for your farm.</p></div>
          <div className="farm-user-chip"><span><WorkspaceIcon name="user" size={19} /></span><div><strong>{name}</strong><small>Farmer</small></div></div>
        </header>

        {activePage === 'dashboard' && <DashboardOverview history={history} setActivePage={setActivePage} name={name} Icon={WorkspaceIcon} />}
        {activePage === 'detection' && <section className="farm-workspace-scan"><CropDetection farmer={farmer} /></section>}
        {activePage === 'chatbot' && <Chatbot onBack={() => setActivePage('dashboard')} farmerId={farmerId} />}
        {activePage === 'reports' && <><ReportsPage history={history} farmerName={name} onDownload={downloadReport} />{reportError && <p role="alert" className="farm-form-error">{reportError}</p>}</>}
        {activePage === 'activities' && <FarmActivityPage activities={activities} setActivities={setActivities} />}
        {activePage === 'planner' && <CropCalendarPage events={events} setEvents={setEvents} />}
        {activePage === 'history' && <AnalysisHistoryPage history={history} loading={historyLoading} error={historyError} onReports={() => setActivePage('reports')} />}
        {activePage === 'recommendations' && <RecommendationPage history={history} setActivePage={setActivePage} />}
        <span className="farm-page-context" aria-live="polite">{pageTitle}</span>
      </main>
    </div>
  )
}

export { DashboardOverview, ReportsPage, FarmActivityPage, CropCalendarPage, FarmWorkspace }
