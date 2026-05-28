import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const SUGGESTED = [
  { icon:'💰', text:'What is my total profit this month?' },
  { icon:'📊', text:'Am I spending too much on any category?' },
  { icon:'📅', text:'When is my next GST filing deadline?' },
  { icon:'📈', text:'What is my cash flow trend?' },
  { icon:'💡', text:'How can I reduce my tax liability?' },
  { icon:'🏢', text:'Which vendor am I paying the most?' },
]

function AIChat() {
  const [messages, setMessages] = useState([{
    role:'assistant',
    text:'Hello! I am your AI CFO Assistant powered by Groq LLaMA 3.3 70B. I have live access to your Supabase financial data. Ask me anything about your finances — by any time period!',
    time: new Date().toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})
  }])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [showSuggested, setShowSuggested] = useState(true)
  const [txnCount, setTxnCount]         = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  useEffect(() => {
    supabase.from('transactions')
      .select('*', { count:'exact', head:true })
      .then(({ count }) => setTxnCount(count))
  }, [])

  const sendMessage = async (text) => {
    const question = text || input.trim()
    if (!question) return
    const time = new Date().toLocaleTimeString('en-IN',
      {hour:'2-digit', minute:'2-digit'})
    setMessages(prev => [...prev, { role:'user', text:question, time }])
    setInput('')
    setLoading(true)
    setShowSuggested(false)
    try {
      const res = await fetch('http://localhost:8000/api/ai/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setMessages(prev => [...prev, {
        role:'assistant', text:data.answer,
        period: data.period,
        time: new Date().toLocaleTimeString('en-IN',
          {hour:'2-digit', minute:'2-digit'})
      }])
    } catch {
      setMessages(prev => [...prev, {
        role:'assistant',
        text:'Sorry, I could not connect to the AI backend. Please make sure FastAPI is running on port 8000.',
        time: new Date().toLocaleTimeString('en-IN',
          {hour:'2-digit', minute:'2-digit'})
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column',
      height:'100vh', background:'#f3f4f6',
      fontFamily:'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, #4c1d95, #7c3aed)',
        padding:'20px 28px', color:'white', flexShrink:0,
        boxShadow:'0 4px 20px rgba(124,58,237,0.25)'
      }}>
        <div style={{ display:'flex', alignItems:'center',
          justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'44px', height:'44px', borderRadius:'12px',
              background:'rgba(255,255,255,0.15)',
              display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'22px' }}>
              🤖
            </div>
            <div>
              <h1 style={{ margin:0, fontSize:'20px', fontWeight:'800',
                letterSpacing:'-0.01em' }}>AI CFO Assistant</h1>
              <p style={{ margin:0, opacity:0.7, fontSize:'12px' }}>
                Powered by Groq LLaMA 3.3 70B
              </p>
            </div>
          </div>

          {/* Stats Pill */}
          <div style={{ background:'rgba(255,255,255,0.12)',
            borderRadius:'10px', padding:'8px 14px',
            border:'1px solid rgba(255,255,255,0.2)',
            backdropFilter:'blur(10px)' }}>
            <p style={{ margin:0, fontSize:'11px',
              opacity:0.7, marginBottom:'1px' }}>Live Data</p>
            <p style={{ margin:0, fontSize:'14px', fontWeight:'700' }}>
              {txnCount ? txnCount.toLocaleString() : '...'} transactions
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px',
        display:'flex', flexDirection:'column', gap:'12px' }}>

        {messages.map((msg, i) => (
          <div key={i} style={{ display:'flex',
            justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start',
            animation:'fadeSlideIn 0.25s ease forwards' }}>

            {/* Bot Avatar */}
            {msg.role==='assistant' && (
              <div style={{ width:'36px', height:'36px', borderRadius:'10px',
                background:'linear-gradient(135deg, #4c1d95, #7c3aed)',
                display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'16px',
                marginRight:'8px', flexShrink:0,
                boxShadow:'0 4px 8px rgba(124,58,237,0.3)',
                alignSelf:'flex-end' }}>
                🤖
              </div>
            )}

            <div style={{ maxWidth:'72%' }}>
              {/* Period badge */}
              {msg.role==='assistant' && msg.period && (
                <p style={{ margin:'0 0 4px 4px', fontSize:'10px',
                  color:'#9ca3af', fontWeight:'500' }}>
                  📅 {msg.period}
                </p>
              )}

              <div style={{
                padding:'13px 16px',
                borderRadius: msg.role==='user'
                  ? '16px 16px 4px 16px'
                  : '16px 16px 16px 4px',
                background: msg.role==='user'
                  ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                  : 'white',
                color: msg.role==='user' ? 'white' : '#111827',
                boxShadow: msg.role==='user'
                  ? '0 4px 12px rgba(124,58,237,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.07)',
                fontSize:'14px', lineHeight:'1.6'
              }}>
                {msg.text}
              </div>

              <p style={{ margin:'4px 0 0',
                fontSize:'10px', color:'#9ca3af',
                textAlign: msg.role==='user' ? 'right' : 'left',
                paddingLeft: msg.role==='assistant' ? '4px' : 0 }}>
                {msg.time}
              </p>
            </div>

            {/* User Avatar */}
            {msg.role==='user' && (
              <div style={{ width:'36px', height:'36px', borderRadius:'10px',
                background:'linear-gradient(135deg, #1e3a5f, #2563eb)',
                display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'16px',
                marginLeft:'8px', flexShrink:0,
                alignSelf:'flex-end' }}>
                👤
              </div>
            )}
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div style={{ display:'flex', alignItems:'flex-end', gap:'8px',
            animation:'fadeSlideIn 0.25s ease forwards' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px',
              background:'linear-gradient(135deg, #4c1d95, #7c3aed)',
              display:'flex', alignItems:'center',
              justifyContent:'center', flexShrink:0 }}>🤖</div>
            <div style={{ background:'white', padding:'14px 18px',
              borderRadius:'16px 16px 16px 4px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)',
              display:'flex', gap:'5px', alignItems:'center' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width:'7px', height:'7px', borderRadius:'50%',
                  background:'#7c3aed', opacity:0.7,
                  animation:`pulse 1.2s ease ${i*0.2}s infinite`
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Questions */}
        {showSuggested && (
          <div style={{ animation:'fadeSlideIn 0.35s ease forwards' }}>
            <p style={{ color:'#9ca3af', fontSize:'12px',
              margin:'8px 0 10px 0', fontWeight:'500' }}>
              💡 Try asking one of these:
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {SUGGESTED.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q.text)} style={{
                  padding:'8px 14px', background:'white',
                  border:'1.5px solid #e5e7eb', borderRadius:'10px',
                  cursor:'pointer', fontSize:'12px', fontWeight:'500',
                  color:'#374151', display:'flex', alignItems:'center',
                  gap:'6px', transition:'all 0.2s',
                  fontFamily:'Inter'
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#7c3aed'
                    e.currentTarget.style.background = '#faf5ff'
                    e.currentTarget.style.color = '#7c3aed'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.background = 'white'
                    e.currentTarget.style.color = '#374151'
                  }}>
                  <span>{q.icon}</span> {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{ padding:'14px 20px', background:'white',
        borderTop:'1px solid #f3f4f6', flexShrink:0,
        boxShadow:'0 -4px 16px rgba(0,0,0,0.05)' }}>
        <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key==='Enter' && sendMessage()}
            placeholder="Ask about your finances... (e.g. What is my profit in March 2025?)"
            style={{ flex:1, padding:'13px 18px',
              border:'1.5px solid #e5e7eb', borderRadius:'12px',
              fontSize:'14px', fontFamily:'Inter', color:'#111827',
              background:'#f9fafb', outline:'none',
              transition:'all 0.2s' }}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
            style={{ width:'46px', height:'46px', borderRadius:'12px',
              background: loading || !input.trim()
                ? '#e5e7eb'
                : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border:'none', cursor: loading || !input.trim()
                ? 'not-allowed' : 'pointer',
              display:'flex', alignItems:'center',
              justifyContent:'center', fontSize:'18px',
              boxShadow: loading || !input.trim()
                ? 'none' : '0 4px 12px rgba(124,58,237,0.3)',
              transition:'all 0.2s', flexShrink:0 }}>
            {loading ? '⏳' : '➤'}
          </button>
        </div>
        <p style={{ margin:'6px 0 0 4px', fontSize:'11px', color:'#d1d5db' }}>
          Groq LLaMA 3.3 70B • Date-aware • {txnCount?.toLocaleString()} transactions in context
        </p>
      </div>
    </div>
  )
}

export default AIChat