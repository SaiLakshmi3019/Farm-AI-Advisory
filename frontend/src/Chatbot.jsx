import { useEffect, useState } from 'react'

const STARTER_QUESTIONS = [
  'What can cause brown spots on tomato leaves?',
  'How can I reduce late blight risk?',
  'What should I check before treating a crop?',
]

const WELCOME_MESSAGE = {
  role: 'bot',
  text: 'Hello! I am your Farm AI Assistant. Ask me about crop diseases, pests, irrigation, fertilizer or farming problems.',
}

function readChatSessions(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function makeSessionId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
}

function Chatbot({ onBack, farmerId = 'guest' }) {
  const storageKey = `farm-ai-chat-sessions-${farmerId}`
  const [sessions, setSessions] = useState(() => readChatSessions(storageKey))
  const [activeSessionId, setActiveSessionId] = useState(() => readChatSessions(storageKey)[0]?.id || makeSessionId())
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState(() => readChatSessions(storageKey)[0]?.messages || [WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const saveConversation = (conversationMessages, sessionId) => {
    const firstQuestion = conversationMessages.find((message) => message.role === 'user')?.text
    if (!firstQuestion) return
    const savedSession = {
      id: sessionId,
      title: firstQuestion.slice(0, 58),
      updatedAt: Date.now(),
      messages: conversationMessages,
    }
    setSessions((current) => [savedSession, ...current.filter((session) => session.id !== sessionId)].slice(0, 30))
  }

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sessions))
    } catch {
      return
    }
  }, [sessions, storageKey])

  const startNewConversation = () => {
    setActiveSessionId(makeSessionId())
    setMessages([WELCOME_MESSAGE])
    setQuestion('')
    setHistoryOpen(false)
  }

  const openConversation = (session) => {
    setActiveSessionId(session.id)
    setMessages(session.messages || [WELCOME_MESSAGE])
    setQuestion('')
    setHistoryOpen(false)
  }

  const deleteConversation = (sessionId) => {
    const remaining = sessions.filter((session) => session.id !== sessionId)
    setSessions(remaining)
    if (sessionId === activeSessionId) {
      const nextSession = remaining[0]
      setActiveSessionId(nextSession?.id || makeSessionId())
      setMessages(nextSession?.messages || [WELCOME_MESSAGE])
    }
  }

  const sendMessage = async () => {
    const text = question.trim()

    if (!text || loading) {
      return
    }

    const sessionId = activeSessionId
    const userMessages = [...messages, { role: 'user', text }]
    setMessages(userMessages)
    saveConversation(userMessages, sessionId)

    setQuestion('')
    setLoading(true)

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/chat/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: text,
            question: text,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Chat request failed'
        )
      }

      const replyMessages = [...userMessages, { role: 'bot', text: data.answer || 'No answer available.' }]
      setMessages(replyMessages)
      saveConversation(replyMessages, sessionId)
    } catch {
      console.error('Farm AI chat request failed.')

      const errorMessages = [...userMessages, { role: 'bot', text: 'Unable to connect to the AI assistant. Please make sure the backend is running.' }]
      setMessages(errorMessages)
      saveConversation(errorMessages, sessionId)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      className="chatbot-page"
      style={{
        minHeight: '100vh',
        background: '#f4faf6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="chatbot-header"
        style={{
          background: '#123524',
          color: 'white',
          padding: '18px 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="chatbot-brand">
          <div className="chatbot-brand-mark" aria-hidden="true">FA</div>
          <div>
            <div className="chatbot-title">Farm AI Assistant</div>
            <div className="chatbot-subtitle">
              Agricultural advisory · General guidance
            </div>
          </div>
        </div>

        <div className="chatbot-header-actions">
          <button type="button" aria-expanded={historyOpen} onClick={() => setHistoryOpen((open) => !open)}>
            Chat history <span>{sessions.length}</span>
          </button>
          <button type="button" onClick={startNewConversation}>New chat</button>
          <button type="button" onClick={onBack}>Back</button>
        </div>
      </div>

      {historyOpen && (
        <aside className="chatbot-history-panel" aria-label="Saved conversations">
          <div className="chatbot-history-heading"><strong>Saved conversations</strong><span>Stored on this device</span></div>
          {sessions.length ? (
            <div className="chatbot-history-list">
              {sessions.map((session) => (
                <article className={`chatbot-history-item ${session.id === activeSessionId ? 'active' : ''}`} key={session.id}>
                  <button type="button" className="chatbot-history-open" onClick={() => openConversation(session)}>
                    <strong>{session.title || 'New conversation'}</strong>
                    <span>{new Date(session.updatedAt || 0).toLocaleString()}</span>
                  </button>
                  <button type="button" className="chatbot-history-delete" aria-label={`Delete conversation ${session.title || ''}`} onClick={() => deleteConversation(session.id)}>Delete</button>
                </article>
              ))}
            </div>
          ) : <p className="chatbot-history-empty">No saved conversations yet.</p>}
        </aside>
      )}

      <div
        className="chatbot-main"
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          padding: '25px',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="chatbot-card"
          style={{
            background: 'white',
            borderRadius: '16px',
            minHeight: '65vh',
            padding: '20px',
            boxShadow:
              '0 5px 25px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingBottom: '20px',
            }}
          >
            {messages.map((message, index) => (
              <div
                className={`chatbot-message-row ${message.role === 'user' ? 'user' : 'assistant'}`}
                key={index}
                style={{
                  display: 'flex',
                  justifyContent:
                    message.role === 'user'
                      ? 'flex-end'
                      : 'flex-start',
                  marginBottom: '14px',
                }}
              >
                <div
                  className={`chatbot-message-bubble ${message.role === 'user' ? 'user' : 'assistant'}`}
                  style={{
                    maxWidth: '75%',
                    padding: '12px 15px',
                    borderRadius: '14px',
                    background:
                      message.role === 'user'
                        ? '#1f8b4c'
                        : '#edf6ef',
                    color:
                      message.role === 'user'
                        ? 'white'
                        : '#173d28',
                    lineHeight: '1.5',
                    fontSize: '14px',
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {messages.length === 1 && !loading && (
              <div className="chatbot-starters">
                <span>START WITH A QUESTION</span>
                <div>
                  {STARTER_QUESTIONS.map((starter) => (
                    <button
                      type="button"
                      key={starter}
                      onClick={() => setQuestion(starter)}
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div
                style={{
                  color: '#6b7c71',
                  fontSize: '13px',
                  padding: '8px',
                }}
              >
                AI is thinking...
              </div>
            )}
          </div>

          <div
            className="chatbot-composer"
            style={{
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid #e8eee9',
              paddingTop: '15px',
            }}
          >
            <input
              aria-label="Ask Farm AI a farming question"
              className="chatbot-input"
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask a farming question..."
              style={{
                flex: 1,
                height: '48px',
                padding: '0 14px',
                border: '1px solid #cad9cf',
                borderRadius: '10px',
                outline: 'none',
                color: '#173d28',
                background: 'white',
              }}
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !question.trim()}
              className="chatbot-send"
              style={{
                minWidth: '100px',
                border: 'none',
                borderRadius: '10px',
                background: loading
                  ? '#9db8a7'
                  : '#176f3d',
                color: 'white',
                fontWeight: '700',
                cursor: loading
                  ? 'not-allowed'
                  : 'pointer',
              }}
            >
              {loading ? '...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chatbot