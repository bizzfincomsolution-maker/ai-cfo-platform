import React, { useState } from 'react'

const GST_RATES = {
  'Essential Goods (Milk, Vegetables)': 0,
  'Basic Goods (Packaged Food)': 5,
  'Standard Goods (Computers, Phones)': 12,
  'General Goods & Services (Software)': 18,
  'Luxury Goods (Cars, Premium Items)': 28,
}

const DEADLINES = [
  { form: 'GSTR-1',  due: '11th June 2026',  desc: 'Monthly sales return',        status: 'upcoming', days: 18 },
  { form: 'GSTR-3B', due: '20th June 2026',  desc: 'Monthly summary return',       status: 'upcoming', days: 27 },
  { form: 'TDS',     due: '31st May 2026',   desc: 'Q4 TDS return',               status: 'urgent',   days: 7  },
  { form: 'GSTR-9',  due: '31st Dec 2026',   desc: 'Annual GST return',           status: 'safe',     days: 221},
  { form: 'Advance Tax', due: '15th Jun 2026', desc: 'Q1 advance tax payment',    status: 'upcoming', days: 22 },
]

function GSTCalculator() {
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('General Goods & Services (Software)')
  const [txnType, setTxnType]   = useState('intrastate')
  const [result, setResult]     = useState(null)

  const calculate = () => {
    const base = parseFloat(amount)
    if (!base || isNaN(base)) return
    const rate = GST_RATES[category]
    const gst  = (base * rate) / 100
    const cgst = txnType === 'intrastate' ? gst / 2 : 0
    const sgst = txnType === 'intrastate' ? gst / 2 : 0
    const igst = txnType === 'interstate' ? gst : 0
    setResult({ base, rate, cgst, sgst, igst, totalGst: gst, final: base + gst })
  }

  const formatRs = v => `Rs.${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #16a34a, #059669)',
        borderRadius: '12px', padding: '24px',
        marginBottom: '24px', color: 'white'
      }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>
          🧾 GST & Tax Calculator
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Calculate CGST/SGST/IGST splits with Indian compliance logic
        </p>
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        {/* Calculator */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
            Calculate GST
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#374151', fontWeight: '600',
              fontSize: '14px', marginBottom: '6px' }}>
              Transaction Amount (Rs.)
            </label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount e.g. 100000"
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '15px', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#374151', fontWeight: '600',
              fontSize: '14px', marginBottom: '6px' }}>
              GST Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '14px', background: 'white'
              }}
            >
              {Object.keys(GST_RATES).map(k => (
                <option key={k} value={k}>{k} — {GST_RATES[k]}%</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#374151', fontWeight: '600',
              fontSize: '14px', marginBottom: '6px' }}>
              Transaction Type
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['intrastate', 'interstate'].map(t => (
                <button key={t}
                  onClick={() => setTxnType(t)}
                  style={{
                    flex: 1, padding: '10px',
                    border: `2px solid ${txnType === t ? '#16a34a' : '#d1d5db'}`,
                    borderRadius: '8px', cursor: 'pointer',
                    background: txnType === t ? '#dcfce7' : 'white',
                    color: txnType === t ? '#16a34a' : '#6b7280',
                    fontWeight: txnType === t ? '600' : '400', fontSize: '13px'
                  }}>
                  {t === 'intrastate' ? '🏠 Intrastate\n(CGST + SGST)' : '✈️ Interstate\n(IGST)'}
                </button>
              ))}
            </div>
          </div>

          <button onClick={calculate} style={{
            width: '100%', padding: '14px',
            background: '#16a34a', color: 'white',
            border: 'none', borderRadius: '8px',
            fontSize: '16px', fontWeight: '600', cursor: 'pointer'
          }}>
            Calculate GST
          </button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '20px', background: '#f0fdf4',
              border: '1px solid #16a34a', borderRadius: '8px', padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#16a34a' }}>
                GST Breakdown
              </h4>
              {[
                ['Base Amount', formatRs(result.base), '#1f2937'],
                ['GST Rate', `${result.rate}%`, '#6b7280'],
                ...(txnType === 'intrastate' ? [
                  ['CGST', formatRs(result.cgst), '#2563eb'],
                  ['SGST', formatRs(result.sgst), '#7c3aed'],
                ] : [
                  ['IGST', formatRs(result.igst), '#ea580c'],
                ]),
                ['Total GST', formatRs(result.totalGst), '#dc2626'],
                ['Final Amount', formatRs(result.final), '#16a34a'],
              ].map(([label, value, color]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: label === 'Total GST' ? '1px solid #d1fae5' : 'none'
                }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>{label}</span>
                  <span style={{ color, fontWeight: '600', fontSize: '14px' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deadline Calendar */}
        <div style={{
          flex: 1, minWidth: '300px',
          background: 'white', borderRadius: '12px',
          padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
            📅 GST Compliance Calendar
          </h3>
          {DEADLINES.map((d, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center',
              gap: '12px', padding: '12px',
              marginBottom: '8px', borderRadius: '8px',
              background: d.status === 'urgent' ? '#fef2f2'
                : d.status === 'upcoming' ? '#fefce8' : '#f0fdf4',
              border: `1px solid ${d.status === 'urgent' ? '#fca5a5'
                : d.status === 'upcoming' ? '#fde047' : '#86efac'}`
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: d.status === 'urgent' ? '#dc2626'
                  : d.status === 'upcoming' ? '#ca8a04' : '#16a34a',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white',
                fontSize: '11px', fontWeight: 'bold', textAlign: 'center',
                flexShrink: 0
              }}>
                {d.days}d
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>
                    {d.form}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '600',
                    color: d.status === 'urgent' ? '#dc2626'
                      : d.status === 'upcoming' ? '#ca8a04' : '#16a34a'
                  }}>
                    {d.status === 'urgent' ? '🔴 URGENT'
                      : d.status === 'upcoming' ? '🟡 UPCOMING' : '🟢 ON TRACK'}
                  </span>
                </div>
                <p style={{ margin: '2px 0 0 0', color: '#6b7280', fontSize: '12px' }}>
                  {d.desc} • Due: {d.due}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GSTCalculator