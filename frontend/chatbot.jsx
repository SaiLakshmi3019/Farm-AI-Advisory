import { useState } from 'react'

function Chatbot({ onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text:
        'Hello! 🌱 I am your Farm AI Assistant. Ask me about crop diseases, pests, irrigation, fertilizer, or crop health.',
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const question = message.trim()

    if (!question || loading) return

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: question,
      },
    ])

    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('http://127.0.0.1:8000/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
        }),
      })

      const data = await response.json()

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            data.answer ||
            'Sorry, I could not generate a response.',
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            'Unable to connect to the Farm AI server. Please check that the backend is running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4f8f5',
        padding: '30px',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        <button
          onClick={onBack}
          style={{
            border: 'none',
            background: 'transparent',
            color: '#176b38',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: '18px',
          }}
        >
          ← Back to Dashboard
        </button>

        <div
          style={{
            background: '#173c28',
            color: 'white',
            padding: '25px',
            borderRadius: '18px 18px 0 0',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              opacity: 0.7,
            }}
          >
            FARM AI ADVISORY
          </div>

          <h1
            style={{
              margin: '8px 0',
              fontSize: '28px',
            }}
          >
            🌱 Agricultural AI Assistant
          </h1>

          <p style={{ color: '#bfd5c7' }}>
            Ask questions about crop health and farming.
          </p>
        </div>

        <div
          style={{
            background: 'white',
            minHeight: '500px',
            padding: '25px',
          }}
        >
          {messages.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent:
                  item.role === 'user'
                    ? 'flex-end'
                    : 'flex-start',
                marginBottom: '15px',
              }}
            >
              <div
                style={{
                  maxWidth: '70%',
                  padding: '13px 16px',
                  borderRadius: '14px',
                  background:
                    item.role === 'user'
                      ? '#1f8b4c'
                      : '#edf5ef',
                  color:
                    item.role === 'user'
                      ? '#fff'
                      : '#244131',
                  lineHeight: 1.6,
                }}
              >
                {item.text}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ color: '#718078' }}>
              AI is searching the knowledge base...
            </div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            padding: '18px',
            display: 'flex',
            gap: '10px',
            borderRadius: '0 0 18px 18px',
          }}
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage()
            }}
            placeholder="Ask about your crop..."
            style={{
              flex: 1,
              padding: '14px',
              border: '1px solid #ccdacf',
              borderRadius: '10px',
              color: '#111',
              background: '#fff',
            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
            style={{
              border: 'none',
              background: '#1f8b4c',
              color: '#fff',
              padding: '0 22px',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot