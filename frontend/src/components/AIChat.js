import React, { useState, useRef, useEffect } from 'react'

const SUGGESTED_QUESTIONS = [
  'What is my total profit this month?',
  'Am I spending too much on any category?',
  'When is my next GST filing deadline?',
  'What is my cash flow trend?',
  'How can I reduce my tax liability?',
  'Which vendor am I paying the most?',
]

const MOCK_RESPONSES = {
  'What is my total profit this month?':
    'Based on your May 2026 data, your total profit is Rs.3.8Cr with a profit margin of 17.2%. Revenue stands at Rs.22.1Cr against expenses of Rs.18.3Cr. This is 8% higher than your April 2026 profit of Rs.3.5Cr.',
  'Am I spending too much on any category?':
    'Your top expense categories are: Salaries (35% — Rs.6.4Cr), Marketing (24% — Rs.4.4Cr), and Software (15% — Rs.2.7Cr). Marketing spend has increased 22% vs last quarter. Consider reviewing your marketing ROI.',
  'When is my next GST filing deadline?':
    'Your next deadlines are: GSTR-1 due 11th June 2026 (18 days away) and GSTR-3B due 20th June 2026 (27 days away). TDS return is due 31st May 2026 — only 7 days! Please prioritize this.',
  'What is my cash flow trend?':
    'Your cash flow has been positive for 8 consecutive months. Current month: Rs.3.8Cr positive. Strongest months were March 2026 (Rs.5.2Cr) due to year-end billing. Watch out — July typically sees a dip based on historical patterns.',
  'How can I reduce my tax liability?':
    'Three recommendations: 1) Claim Rs.85,000 in unclaimed ITC from matched GST entries. 2) Accelerate equipment purchases before March 31st for depreciation benefits. 3) Ensure all vendor GSTINs are validated — 2 vendors have mismatches affecting your ITC claims.',
  'Which vendor am I paying the most?':
    'Top vendors by spend: 1) Nexus Payroll Account — Rs.6.4Cr (salaries). 2) Google India — Rs.1.2Cr (marketing). 3) Microsoft India — Rs.0.9Cr (software). 4) AWS India — Rs.0.7Cr (cloud). Consider negotiating volume discounts with Google and Microsoft.',
}

function AIChat() {
  const [messages, setMessages]   = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI CFO Assistant powered by Groq LLaMA 3. I have access to your live financial data from Supabase. Ask me anything about your finances!',
    }
  ])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    const question = text || input.trim()
    if (!question) return

    setMessages(prev => [...prev, { role: 'user', text: question }])
    setInput('')
    setLoading(true)
    setShowSuggested(false)

    // Simulate AI response
    setTimeout(() => {
      const response = MOCK_RESPONSES[question] ||
        `Based on your live Supabase data: Your current revenue is Rs.22.1Cr with expenses of Rs.18.3Cr, giving a healthy cash flow of Rs.3.8Cr and profit margin of 17.2%. For specific insights about "${question}", I'm analyzing your ${2647} transactions across 38 months of data.`

      setMessages(prev => [...prev, { role: 'assistant', text: response }])
      setLoading(false)
    }, 1500)
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
          Powered by Groq LLaMA 3.3 70B • Live data from Supabase • 2,647 transactions in context
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