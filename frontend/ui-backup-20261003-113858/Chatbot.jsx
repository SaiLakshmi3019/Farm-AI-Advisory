import { useState } from 'react'

function Chatbot({ onBack }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hello! I am your Farm AI Assistant. Ask me about crop diseases, pests, irrigation, fertilizer or farming problems.',
    },
  ])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    const text = question.trim()

    if (!text || loading) {
      return
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text,
      },
    ])

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

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            data.answer ||
            'No answer available.',
        },
      ])
    } catch (error) {
      console.error(error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text:
            'Unable to connect to the AI assistant. Please make sure the backend is running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f4faf6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          background: '#123524',
          color: 'white',
          padding: '18px 25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            🤖 Farm AI Assistant
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.75,
              marginTop: '4px',
            }}
          >
            Agricultural Advisory Chatbot
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'transparent',
            color: 'white',
            padding: '9px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
      </div>

      <div
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
            style={{
              display: 'flex',
              gap: '10px',
              borderTop: '1px solid #e8eee9',
              paddingTop: '15px',
            }}
          >
            <input
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
              disabled={loading}
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