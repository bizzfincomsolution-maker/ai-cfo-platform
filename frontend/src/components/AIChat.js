import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const SUGGESTED_QUESTIONS = [
  'What is my total profit this month?',
  'Am I spending too much on any category?',
  'When is my next GST filing deadline?',
  'What is my cash flow trend?',
  'How can I reduce my tax liability?',
  'Which vendor am I paying the most?',
]

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI CFO Assistant powered by Groq LLaMA 3. I have access to your live financial data from Supabase. Ask me anything about your finances!',
    }
  ])
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const [txnCount, setTxnCount]           = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch real transaction count from Supabase
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
      setTxnCount(count)
    }
    fetchCount()
  }, [])

  const sendMessage = async (text) => {
    const question = text || input.trim()
    if (!question) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setShowSuggested(false)

    try {
      const response = await fetch('http://localhost:8000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })
      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: data.answer
      }])
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, I could not connect to the AI backend. Please make sure FastAPI is running on port 8000.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: '#f3f4f6'
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
        padding: '20px 24px', color: 'white',
        flexShrink: 0
      }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>
          🤖 AI CFO Assistant
        </h1>
        <p style={{ margin: 0, opacity: 0.8, fontSize: '13px' }}>
          Powered by Groq LLaMA 3.3 70B • Live data from Supabase • {txnCount ? txnCount.toLocaleString() : 'Loading...'} transactions in context
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '24px', display: 'flex',
        flexDirection: 'column', gap: '16px'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {msg.role === 'assistant' && (
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: '#7c3aed', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '16px',
                marginRight: '8px', flexShrink: 0
              }}>🤖</div>
            )}
            <div style={{
              maxWidth: '70%', padding: '12px 16px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#7c3aed' : 'white',
              color: msg.role === 'user' ? 'white' : '#1f2937',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: '14px', lineHeight: '1.5'
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#7c3aed', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white'
            }}>🤖</div>
            <div style={{
              background: 'white', padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              color: '#7c3aed', fontSize: '14px'
            }}>
              ⏳ Analyzing your financial data...
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {showSuggested && (
          <div>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 12px 0' }}>
              💡 Try asking:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    padding: '8px 14px', background: 'white',
                    border: '1px solid #e5e7eb', borderRadius: '20px',
                    cursor: 'pointer', fontSize: '13px',
                    color: '#7c3aed', transition: 'all 0.2s'
                  }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 24px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your finances... (e.g. What is my profit margin?)"
            style={{
              flex: 1, padding: '12px 16px',
              border: '1px solid #d1d5db', borderRadius: '24px',
              fontSize: '14px', outline: 'none'
            }}
          />
          <button
            onClick={() => sendMessage()}
            style={{
              padding: '12px 24px',
              background: '#7c3aed', color: 'white',
              border: 'none', borderRadius: '24px',
              cursor: 'pointer', fontSize: '14px',
              fontWeight: '600'
            }}>
            Send ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default AIChat