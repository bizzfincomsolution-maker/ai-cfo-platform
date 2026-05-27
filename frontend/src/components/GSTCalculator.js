import React, { useState, useEffect } from 'react'

const GST_CATEGORIES = {
  'essential_goods':  'Essential Goods (Milk, Vegetables) — 0%',
  'basic_goods':      'Basic Goods (Packaged Food, Medicines) — 5%',
  'standard_goods':   'Standard Goods (Computers, Phones) — 12%',
  'general_goods':    'General Goods & Services (Software) — 18%',
  'luxury_goods':     'Luxury Goods (Cars, Premium Items) — 28%',
}

function GSTCalculator() {
  const [amount, setAmount]         = useState('')
  const [category, setCategory]     = useState('general_goods')
  const [txnType, setTxnType]       = useState('intrastate')
  const [saveToDb, setSaveToDb]     = useState(false)
  const [result, setResult]         = useState(null)
  const [calculating, setCalculating] = useState(false)

  const [taxIncome, setTaxIncome]   = useState('')
  const [taxResult, setTaxResult]   = useState(null)
  const [calcTax, setCalcTax]       = useState(false)

  const [deadlines, setDeadlines]   = useState([])
  const [loadingDeadlines, setLoadingDeadlines] = useState(true)

  // Fetch real deadlines from backend
  useEffect(() => {
    const fetchDeadlines = async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/gst/deadlines')
        const data = await res.json()
        setDeadlines(data.deadlines)
      } catch (err) {
        console.error('Failed to fetch deadlines:', err)
      } finally {
        setLoadingDeadlines(false)
      }
    }
    fetchDeadlines()
  }, [])

  // Calculate GST via backend
  const calculateGST = async () => {
    const base = parseFloat(amount)
    if (!base || isNaN(base)) return
    setCalculating(true)
    setResult(null)

    try {
      const res = await fetch('http://localhost:8000/api/gst/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:           base,
          category:         category,
          transaction_type: txnType,
          save_to_db:       saveToDb,
          vendor_name:      'Manual Calculation',
          description:      `GST calculation — ${GST_CATEGORIES[category]}`
        })
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      alert('Error connecting to backend. Make sure FastAPI is running.')
    } finally {
      setCalculating(false)
    }
  }

  // Calculate Income Tax via backend
  const calculateTax = async () => {
    const income = parseFloat(taxIncome)
    if (!income || isNaN(income)) return
    setCalcTax(true)
    setTaxResult(null)

    try {
      const res = await fetch('http://localhost:8000/api/gst/calculate-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ annual_income: income, regime: 'new' })
      })
      const data = await res.json()
      setTaxResult(data)
    } catch (err) {
      alert('Error connecting to backend.')
    } finally {
      setCalcTax(false)
    }
  }

  const formatRs = (v) => {
    if (!v && v !== 0) return 'Rs.0'
    return `Rs.${parseFloat(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
  }

  const urgencyColors = {
    critical: { bg: '#fef2f2', border: '#fca5a5', badge: '#dc2626', text: '🔴 OVERDUE'   },
    urgent:   { bg: '#fef2f2', border: '#fca5a5', badge: '#dc2626', text: '🔴 URGENT'    },
    warning:  { bg: '#fefce8', border: '#fde047', badge: '#ca8a04', text: '🟡 UPCOMING'  },
    safe:     { bg: '#f0fdf4', border: '#86efac', badge: '#16a34a', text: '🟢 ON TRACK'  },
  }

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
          Calculate CGST/SGST/IGST with Indian compliance logic • Powered by real backend API
        </p>
      </div>

      {/* Row 1 — GST Calculator + Deadline Calendar */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* GST Calculator */}
        <div style={{
          flex: 1, minWidth: '300px', background: 'white',
          borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
            Calculate GST
          </h3>

          {/* Amount Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#374151',
              fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
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

          {/* Category Dropdown */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#374151',
              fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
              GST Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '13px', background: 'white'
              }}
            >
              {Object.entries(GST_CATEGORIES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#374151',
              fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
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
                    fontWeight: txnType === t ? '600' : '400',
                    fontSize: '13px'
                  }}>
                  {t === 'intrastate' ? '🏠 Intrastate (CGST+SGST)' : '✈️ Interstate (IGST)'}
                </button>
              ))}
            </div>
          </div>

          {/* Save to DB Toggle */}
          <div style={{ marginBottom: '20px', display: 'flex',
            alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              id="save-db"
              checked={saveToDb}
              onChange={e => setSaveToDb(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="save-db" style={{ color: '#374151',
              fontSize: '14px', cursor: 'pointer' }}>
              Save to Supabase (updates dashboard in real-time)
            </label>
          </div>

          {/* Calculate Button */}
          <button onClick={calculateGST} disabled={calculating}
            style={{
              width: '100%', padding: '14px',
              background: calculating ? '#86efac' : '#16a34a',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '16px', fontWeight: '600',
              cursor: calculating ? 'not-allowed' : 'pointer'
            }}>
            {calculating ? '⏳ Calculating...' : 'Calculate GST'}
          </button>

          {/* Result */}
          {result && (
            <div style={{
              marginTop: '20px', background: '#f0fdf4',
              border: '1px solid #16a34a', borderRadius: '8px',
              padding: '16px'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#16a34a' }}>
                GST Breakdown
              </h4>
              {[
                ['Base Amount',  formatRs(result.base_amount),  '#1f2937'],
                ['GST Rate',     `${result.gst_rate_pct}%`,     '#6b7280'],
                ...(result.transaction_type === 'intrastate' ? [
                  ['CGST',       formatRs(result.cgst),         '#2563eb'],
                  ['SGST',       formatRs(result.sgst),         '#7c3aed'],
                ] : [
                  ['IGST',       formatRs(result.igst),         '#ea580c'],
                ]),
                ['Total GST',   formatRs(result.total_gst),    '#dc2626'],
                ['Final Amount',formatRs(result.final_amount),  '#16a34a'],
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
              {result.saved_to_db && (
                <p style={{ color: '#16a34a', fontSize: '12px',
                  margin: '10px 0 0 0', fontWeight: '600' }}>
                  ⚡ Saved to Supabase — dashboard updated!
                </p>
              )}
            </div>
          )}
        </div>

        {/* GST Compliance Calendar */}
        <div style={{
          flex: 1, minWidth: '300px', background: 'white',
          borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
            📅 GST Compliance Calendar
          </h3>

          {loadingDeadlines ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              ⏳ Loading deadlines...
            </p>
          ) : (
            deadlines.map((d, i) => {
              const colors = urgencyColors[d.urgency] || urgencyColors.safe
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start',
                  gap: '12px', padding: '12px',
                  marginBottom: '10px', borderRadius: '8px',
                  background: colors.bg, border: `1px solid ${colors.border}`
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '8px',
                    background: colors.badge, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '11px', fontWeight: 'bold',
                    textAlign: 'center', flexShrink: 0, lineHeight: '1.2'
                  }}>
                    {d.days_remaining < 0
                      ? 'DUE'
                      : `${d.days_remaining}d`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex',
                      justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#1f2937',
                        fontSize: '14px' }}>{d.form}</span>
                      <span style={{ fontSize: '11px', fontWeight: '600',
                        color: colors.badge }}>{colors.text}</span>
                    </div>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '12px' }}>
                      {d.description}
                    </p>
                    <p style={{ margin: '2px 0', color: '#6b7280', fontSize: '11px' }}>
                      Due: {d.due_date} • {d.frequency}
                    </p>
                    <p style={{ margin: '2px 0', color: '#dc2626', fontSize: '11px' }}>
                      Penalty: {d.penalty}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Row 2 — Income Tax Calculator */}
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          💼 Income Tax Calculator — FY 2025-26 (New Regime)
        </h3>

        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

          {/* Tax Input */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', color: '#374151',
              fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
              Annual Income (Rs.)
            </label>
            <input
              type="number"
              value={taxIncome}
              onChange={e => setTaxIncome(e.target.value)}
              placeholder="Enter annual income e.g. 1500000"
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid #d1d5db', borderRadius: '8px',
                fontSize: '15px', boxSizing: 'border-box',
                marginBottom: '12px'
              }}
            />
            <button onClick={calculateTax} disabled={calcTax}
              style={{
                width: '100%', padding: '12px',
                background: calcTax ? '#93c5fd' : '#2563eb',
                color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '15px', fontWeight: '600',
                cursor: calcTax ? 'not-allowed' : 'pointer'
              }}>
              {calcTax ? '⏳ Calculating...' : 'Calculate Income Tax'}
            </button>

            {/* Tax Result */}
            {taxResult && (
              <div style={{
                marginTop: '16px', background: '#eff6ff',
                border: '1px solid #2563eb', borderRadius: '8px',
                padding: '16px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
                  Tax Summary
                </h4>
                {[
                  ['Annual Income',    formatRs(taxResult.annual_income),    '#1f2937'],
                  ['Gross Tax',        formatRs(taxResult.gross_tax),        '#6b7280'],
                  ['Rebate u/s 87A',  `-${formatRs(taxResult.rebate_87a)}`, '#16a34a'],
                  ['Tax After Rebate', formatRs(taxResult.tax_after_rebate), '#6b7280'],
                  ['Cess @ 4%',        formatRs(taxResult.cess_4pct),       '#ea580c'],
                  ['Total Tax',        formatRs(taxResult.total_tax),       '#dc2626'],
                  ['Effective Rate',   taxResult.effective_rate,             '#7c3aed'],
                  ['Monthly TDS',      formatRs(taxResult.monthly_tds),     '#2563eb'],
                  ['Take Home (Annual)',formatRs(taxResult.take_home_annual),'#16a34a'],
                ].map(([label, value, color]) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '5px 0',
                    borderBottom: label === 'Total Tax' ? '1px solid #bfdbfe' : 'none'
                  }}>
                    <span style={{ color: '#6b7280', fontSize: '13px' }}>{label}</span>
                    <span style={{ color, fontWeight: '600', fontSize: '13px' }}>{value}</span>
                  </div>
                ))}
                {taxResult.rebate_87a > 0 && (
                  <p style={{ color: '#16a34a', fontSize: '11px',
                    margin: '10px 0 0 0', fontWeight: '600' }}>
                    ✅ Eligible for full tax rebate u/s 87A — Zero tax payable!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tax Slabs Table */}
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151' }}>
              New Tax Regime — FY 2025-26
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#1e3a5f' }}>
                  {['Income Slab', 'Tax Rate'].map(h => (
                    <th key={h} style={{ padding: '10px', textAlign: 'left',
                      fontSize: '12px', color: 'white', fontWeight: '600' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Up to Rs.4,00,000',           '0% (Nil)'],
                  ['Rs.4,00,001 - Rs.8,00,000',   '5%'],
                  ['Rs.8,00,001 - Rs.12,00,000',  '10%'],
                  ['Rs.12,00,001 - Rs.16,00,000', '15%'],
                  ['Rs.16,00,001 - Rs.20,00,000', '20%'],
                  ['Rs.20,00,001 - Rs.24,00,000', '25%'],
                  ['Above Rs.24,00,000',           '30%'],
                ].map(([slab, rate], i) => (
                  <tr key={i} style={{
                    background: i % 2 === 0 ? 'white' : '#f3f4f6'
                  }}>
                    <td style={{ padding: '8px 10px', fontSize: '12px',
                      color: '#374151' }}>{slab}</td>
                    <td style={{ padding: '8px 10px', fontSize: '12px',
                      fontWeight: '600', color: '#2563eb' }}>{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{
              marginTop: '12px', padding: '10px 12px',
              background: '#f0fdf4', border: '1px solid #16a34a',
              borderRadius: '8px', fontSize: '12px', color: '#16a34a'
            }}>
              <b>Rebate u/s 87A:</b> Full rebate up to Rs.60,000 for income
              up to Rs.12,00,000 → Zero tax payable!
            </div>
            <div style={{
              marginTop: '8px', padding: '10px 12px',
              background: '#eff6ff', border: '1px solid #2563eb',
              borderRadius: '8px', fontSize: '12px', color: '#2563eb'
            }}>
              <b>Health & Education Cess:</b> 4% on total tax payable
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GSTCalculator