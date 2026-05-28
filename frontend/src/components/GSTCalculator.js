import React, { useState, useEffect } from 'react'

const GST_CATEGORIES = {
  'essential_goods':  'Essential Goods (Milk, Vegetables) — 0%',
  'basic_goods':      'Basic Goods (Packaged Food, Medicines) — 5%',
  'standard_goods':   'Standard Goods (Computers, Phones) — 12%',
  'general_goods':    'General Goods & Services (Software) — 18%',
  'luxury_goods':     'Luxury Goods (Cars, Premium Items) — 28%',
}

const TAX_SLABS = [
  ['Up to Rs.4,00,000',            '0% (Nil)'],
  ['Rs.4,00,001 – Rs.8,00,000',    '5%'],
  ['Rs.8,00,001 – Rs.12,00,000',   '10%'],
  ['Rs.12,00,001 – Rs.16,00,000',  '15%'],
  ['Rs.16,00,001 – Rs.20,00,000',  '20%'],
  ['Rs.20,00,001 – Rs.24,00,000',  '25%'],
  ['Above Rs.24,00,000',            '30%'],
]

const urgencyStyle = {
  critical: { bg:'#fef2f2', border:'#fca5a5', badge:'#dc2626', text:'🔴 OVERDUE'  },
  urgent:   { bg:'#fef2f2', border:'#fca5a5', badge:'#dc2626', text:'🔴 URGENT'   },
  warning:  { bg:'#fefce8', border:'#fde047', badge:'#ca8a04', text:'🟡 UPCOMING' },
  safe:     { bg:'#f0fdf4', border:'#86efac', badge:'#16a34a', text:'🟢 ON TRACK' },
}

function GSTCalculator() {
  const [amount, setAmount]           = useState('')
  const [category, setCategory]       = useState('general_goods')
  const [txnType, setTxnType]         = useState('intrastate')
  const [saveToDb, setSaveToDb]       = useState(false)
  const [result, setResult]           = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [taxIncome, setTaxIncome]     = useState('')
  const [taxResult, setTaxResult]     = useState(null)
  const [calcTax, setCalcTax]         = useState(false)
  const [deadlines, setDeadlines]     = useState([])
  const [loadingDL, setLoadingDL]     = useState(true)

  useEffect(() => {
    fetch('http://localhost:8000/api/gst/deadlines')
      .then(r => r.json())
      .then(d => setDeadlines(d.deadlines))
      .catch(console.error)
      .finally(() => setLoadingDL(false))
  }, [])

  const calculateGST = async () => {
    const base = parseFloat(amount)
    if (!base || isNaN(base)) return
    setCalculating(true); setResult(null)
    try {
      const res = await fetch('http://localhost:8000/api/gst/calculate', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ amount:base, category, transaction_type:txnType,
          save_to_db:saveToDb, vendor_name:'Manual', description:'GST calculation' })
      })
      setResult(await res.json())
    } catch { alert('Backend error') }
    finally { setCalculating(false) }
  }

  const calculateTax = async () => {
    const income = parseFloat(taxIncome)
    if (!income || isNaN(income)) return
    setCalcTax(true); setTaxResult(null)
    try {
      const res = await fetch('http://localhost:8000/api/gst/calculate-tax', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ annual_income:income, regime:'new' })
      })
      setTaxResult(await res.json())
    } catch { alert('Backend error') }
    finally { setCalcTax(false) }
  }

  const fmtRs = v => v ? `Rs.${parseFloat(v).toLocaleString('en-IN',
    {minimumFractionDigits:2})}` : 'Rs.0.00'

  return (
    <div style={{ padding:'24px', background:'#f3f4f6', minHeight:'100vh',
      fontFamily:'Inter, sans-serif', animation:'fadeSlideIn 0.35s ease forwards' }}>

      {/* Header */}
      <div style={{
        background:'linear-gradient(135deg, #14532d, #16a34a)',
        borderRadius:'16px', padding:'28px 32px',
        marginBottom:'24px', color:'white',
        boxShadow:'0 8px 32px rgba(22,163,74,0.2)',
        position:'relative', overflow:'hidden'
      }}>
        <div style={{ position:'absolute', top:'-40px', right:'-40px',
          width:'180px', height:'180px', borderRadius:'50%',
          background:'rgba(255,255,255,0.05)' }}/>
        <div style={{ display:'flex', alignItems:'center',
          gap:'12px', marginBottom:'6px' }}>
          <div style={{ width:'40px', height:'40px', borderRadius:'10px',
            background:'rgba(255,255,255,0.15)', display:'flex',
            alignItems:'center', justifyContent:'center', fontSize:'20px' }}>
            🧾
          </div>
          <h1 style={{ margin:0, fontSize:'24px', fontWeight:'800',
            letterSpacing:'-0.02em' }}>GST & Tax Calculator</h1>
        </div>
        <p style={{ margin:0, opacity:0.75, fontSize:'14px' }}>
          Calculate CGST/SGST/IGST with Indian compliance logic •
          FY 2025-26 New Tax Regime
        </p>
      </div>

      {/* Row 1 — GST Calc + Calendar */}
      <div style={{ display:'flex', gap:'20px',
        marginBottom:'20px', flexWrap:'wrap' }}>

        {/* GST Calculator Card */}
        <div style={{ flex:1, minWidth:'300px', background:'white',
          borderRadius:'16px', padding:'24px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 20px 0', fontSize:'16px',
            fontWeight:'700', color:'#111827' }}>
            Calculate GST
          </h3>

          {/* Amount */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', color:'#6b7280', fontSize:'11px',
              fontWeight:'600', marginBottom:'6px', textTransform:'uppercase',
              letterSpacing:'0.05em' }}>Transaction Amount (Rs.)</label>
            <input type="number" value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Enter amount e.g. 100000"
              style={{ width:'100%', padding:'11px 14px',
                border:'1.5px solid #e5e7eb', borderRadius:'10px',
                fontSize:'15px', boxSizing:'border-box',
                fontFamily:'Inter', color:'#111827',
                transition:'all 0.2s' }} />
          </div>

          {/* Category */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', color:'#6b7280', fontSize:'11px',
              fontWeight:'600', marginBottom:'6px', textTransform:'uppercase',
              letterSpacing:'0.05em' }}>GST Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ width:'100%', padding:'11px 14px',
                border:'1.5px solid #e5e7eb', borderRadius:'10px',
                fontSize:'13px', background:'white', fontFamily:'Inter',
                color:'#111827', transition:'all 0.2s' }}>
              {Object.entries(GST_CATEGORIES).map(([k,v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Transaction Type */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', color:'#6b7280', fontSize:'11px',
              fontWeight:'600', marginBottom:'6px', textTransform:'uppercase',
              letterSpacing:'0.05em' }}>Transaction Type</label>
            <div style={{ display:'flex', gap:'10px' }}>
              {[
                { val:'intrastate', label:'🏠 Intrastate', sub:'CGST + SGST' },
                { val:'interstate', label:'✈️ Interstate', sub:'IGST only'   },
              ].map(t => (
                <button key={t.val} onClick={() => setTxnType(t.val)} style={{
                  flex:1, padding:'10px', borderRadius:'10px',
                  border: `2px solid ${txnType===t.val ? '#16a34a' : '#e5e7eb'}`,
                  background: txnType===t.val ? '#f0fdf4' : 'white',
                  cursor:'pointer', transition:'all 0.2s', textAlign:'center'
                }}>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:'600',
                    color: txnType===t.val ? '#16a34a' : '#374151' }}>
                    {t.label}
                  </p>
                  <p style={{ margin:0, fontSize:'11px',
                    color: txnType===t.val ? '#16a34a' : '#9ca3af' }}>
                    {t.sub}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Toggle */}
          <label style={{ display:'flex', alignItems:'center', gap:'10px',
            marginBottom:'18px', cursor:'pointer' }}>
            <div onClick={() => setSaveToDb(!saveToDb)} style={{
              width:'40px', height:'22px', borderRadius:'999px',
              background: saveToDb ? '#16a34a' : '#e5e7eb',
              position:'relative', transition:'all 0.2s', flexShrink:0,
              cursor:'pointer'
            }}>
              <div style={{
                width:'18px', height:'18px', borderRadius:'50%',
                background:'white', position:'absolute',
                top:'2px', left: saveToDb ? '20px' : '2px',
                transition:'all 0.2s',
                boxShadow:'0 1px 4px rgba(0,0,0,0.2)'
              }}/>
            </div>
            <span style={{ fontSize:'13px', color:'#374151', fontWeight:'500' }}>
              Save to Supabase (updates dashboard live)
            </span>
          </label>

          {/* Button */}
          <button onClick={calculateGST} disabled={calculating} style={{
            width:'100%', padding:'13px',
            background: calculating ? '#86efac'
              : 'linear-gradient(135deg, #16a34a, #22c55e)',
            color:'white', border:'none', borderRadius:'10px',
            fontSize:'15px', fontWeight:'600', cursor: calculating
              ? 'not-allowed' : 'pointer',
            boxShadow: calculating ? 'none' : '0 4px 12px rgba(22,163,74,0.3)',
            transition:'all 0.2s', fontFamily:'Inter'
          }}>
            {calculating ? '⏳ Calculating...' : 'Calculate GST →'}
          </button>

          {/* Result */}
          {result && (
            <div style={{ marginTop:'16px', background:'#f0fdf4',
              border:'1px solid #86efac', borderRadius:'12px', padding:'16px' }}>
              <p style={{ margin:'0 0 12px 0', fontSize:'13px',
                fontWeight:'700', color:'#16a34a' }}>GST Breakdown</p>
              {[
                ['Base Amount',  fmtRs(result.base_amount),  '#111827', true],
                ['GST Rate',     `${result.gst_rate_pct}%`,  '#6b7280', false],
                ...(result.transaction_type==='intrastate' ? [
                  ['CGST',       fmtRs(result.cgst),         '#2563eb', false],
                  ['SGST',       fmtRs(result.sgst),         '#7c3aed', false],
                ] : [
                  ['IGST',       fmtRs(result.igst),         '#ea580c', false],
                ]),
                ['Total GST',   fmtRs(result.total_gst),    '#dc2626', false],
                ['Final Amount',fmtRs(result.final_amount),  '#16a34a', true],
              ].map(([label, value, color, bold]) => (
                <div key={label} style={{ display:'flex',
                  justifyContent:'space-between', padding:'6px 0',
                  borderBottom: label==='Total GST'
                    ? '1px solid #d1fae5' : 'none' }}>
                  <span style={{ fontSize:'13px', color:'#6b7280' }}>{label}</span>
                  <span style={{ fontSize:'13px', color, fontWeight: bold ? '700' : '600' }}>
                    {value}
                  </span>
                </div>
              ))}
              {result.saved_to_db && (
                <p style={{ margin:'10px 0 0 0', fontSize:'12px',
                  color:'#16a34a', fontWeight:'600' }}>
                  ⚡ Saved to Supabase — dashboard updated!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Compliance Calendar */}
        <div style={{ flex:1, minWidth:'300px', background:'white',
          borderRadius:'16px', padding:'24px',
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 4px 0', fontSize:'16px',
            fontWeight:'700', color:'#111827' }}>
            📅 GST Compliance Calendar
          </h3>
          <p style={{ margin:'0 0 16px 0', fontSize:'12px', color:'#9ca3af' }}>
            Real deadlines — fetched from backend API
          </p>

          {loadingDL ? (
            <div style={{ textAlign:'center', padding:'40px', color:'#9ca3af' }}>
              ⏳ Loading deadlines...
            </div>
          ) : deadlines.map((d, i) => {
            const s = urgencyStyle[d.urgency] || urgencyStyle.safe
            return (
              <div key={i} style={{ display:'flex', gap:'12px',
                padding:'12px', marginBottom:'8px', borderRadius:'10px',
                background:s.bg, border:`1px solid ${s.border}`,
                transition:'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}
              >
                <div style={{ width:'44px', height:'44px',
                  borderRadius:'10px', background:s.badge,
                  display:'flex', alignItems:'center',
                  justifyContent:'center', color:'white',
                  fontSize:'12px', fontWeight:'800',
                  textAlign:'center', flexShrink:0, lineHeight:1.2 }}>
                  {d.days_remaining < 0 ? 'DUE' : `${d.days_remaining}d`}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center' }}>
                    <span style={{ fontWeight:'700', color:'#111827',
                      fontSize:'13px' }}>{d.form}</span>
                    <span style={{ fontSize:'10px', fontWeight:'700',
                      color:s.badge }}>{s.text}</span>
                  </div>
                  <p style={{ margin:'2px 0', color:'#6b7280', fontSize:'11px' }}>
                    {d.description}
                  </p>
                  <p style={{ margin:'2px 0', color:'#9ca3af', fontSize:'10px' }}>
                    Due: {d.due_date} • {d.frequency}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Income Tax Calculator */}
      <div style={{ background:'white', borderRadius:'16px',
        padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin:'0 0 4px 0', fontSize:'16px',
          fontWeight:'700', color:'#111827' }}>
          💼 Income Tax Calculator — FY 2025-26
        </h3>
        <p style={{ margin:'0 0 20px 0', fontSize:'12px', color:'#9ca3af' }}>
          New Tax Regime • Rebate u/s 87A • Health & Education Cess @ 4%
        </p>

        <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>

          {/* Input */}
          <div style={{ flex:1, minWidth:'250px' }}>
            <label style={{ display:'block', color:'#6b7280', fontSize:'11px',
              fontWeight:'600', marginBottom:'6px', textTransform:'uppercase',
              letterSpacing:'0.05em' }}>Annual Income (Rs.)</label>
            <input type="number" value={taxIncome}
              onChange={e => setTaxIncome(e.target.value)}
              placeholder="e.g. 1500000"
              style={{ width:'100%', padding:'11px 14px',
                border:'1.5px solid #e5e7eb', borderRadius:'10px',
                fontSize:'15px', boxSizing:'border-box',
                fontFamily:'Inter', marginBottom:'12px' }} />
            <button onClick={calculateTax} disabled={calcTax} style={{
              width:'100%', padding:'13px',
              background: calcTax ? '#93c5fd'
                : 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color:'white', border:'none', borderRadius:'10px',
              fontSize:'15px', fontWeight:'600',
              cursor: calcTax ? 'not-allowed' : 'pointer',
              boxShadow: calcTax ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
              fontFamily:'Inter', transition:'all 0.2s'
            }}>
              {calcTax ? '⏳ Calculating...' : 'Calculate Income Tax →'}
            </button>

            {taxResult && (
              <div style={{ marginTop:'16px', background:'#eff6ff',
                border:'1px solid #93c5fd', borderRadius:'12px', padding:'16px' }}>
                <p style={{ margin:'0 0 12px 0', fontSize:'13px',
                  fontWeight:'700', color:'#2563eb' }}>Tax Summary</p>
                {[
                  ['Annual Income',    fmtRs(taxResult.annual_income),    '#111827', true],
                  ['Gross Tax',        fmtRs(taxResult.gross_tax),        '#6b7280', false],
                  ['Rebate u/s 87A',  `-${fmtRs(taxResult.rebate_87a)}`, '#16a34a', false],
                  ['Tax After Rebate', fmtRs(taxResult.tax_after_rebate), '#6b7280', false],
                  ['Cess @ 4%',        fmtRs(taxResult.cess_4pct),       '#ea580c', false],
                  ['Total Tax',        fmtRs(taxResult.total_tax),       '#dc2626', true],
                  ['Effective Rate',   taxResult.effective_rate,           '#7c3aed', false],
                  ['Monthly TDS',      fmtRs(taxResult.monthly_tds),     '#2563eb', false],
                  ['Take Home',        fmtRs(taxResult.take_home_annual), '#16a34a', true],
                ].map(([label, value, color, bold]) => (
                  <div key={label} style={{ display:'flex',
                    justifyContent:'space-between', padding:'5px 0',
                    borderBottom: label==='Total Tax'
                      ? '1px solid #bfdbfe' : 'none' }}>
                    <span style={{ fontSize:'12px', color:'#6b7280' }}>{label}</span>
                    <span style={{ fontSize:'12px', color,
                      fontWeight: bold ? '700' : '600' }}>{value}</span>
                  </div>
                ))}
                {taxResult.rebate_87a > 0 && (
                  <div style={{ marginTop:'10px', padding:'8px 10px',
                    background:'#dcfce7', borderRadius:'8px',
                    fontSize:'11px', color:'#16a34a', fontWeight:'600' }}>
                    ✅ Eligible for full rebate u/s 87A — Zero tax!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Slabs Table */}
          <div style={{ flex:1, minWidth:'250px' }}>
            <p style={{ margin:'0 0 10px 0', fontSize:'13px',
              fontWeight:'600', color:'#374151' }}>
              New Regime Tax Slabs — FY 2025-26
            </p>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#1e3a5f' }}>
                  <th style={{ padding:'10px 12px', textAlign:'left',
                    fontSize:'11px', color:'white', fontWeight:'600',
                    borderRadius:'8px 0 0 0' }}>Income Slab</th>
                  <th style={{ padding:'10px 12px', textAlign:'right',
                    fontSize:'11px', color:'white', fontWeight:'600',
                    borderRadius:'0 8px 0 0' }}>Rate</th>
                </tr>
              </thead>
              <tbody>
                {TAX_SLABS.map(([slab, rate], i) => (
                  <tr key={i} style={{
                    background: i%2===0 ? 'white' : '#f9fafb' }}>
                    <td style={{ padding:'9px 12px', fontSize:'12px',
                      color:'#374151' }}>{slab}</td>
                    <td style={{ padding:'9px 12px', fontSize:'12px',
                      fontWeight:'700', color:'#2563eb',
                      textAlign:'right' }}>{rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop:'10px', padding:'10px 12px',
              background:'#f0fdf4', border:'1px solid #86efac',
              borderRadius:'8px', fontSize:'12px', color:'#16a34a',
              fontWeight:'500' }}>
              <b>Rebate u/s 87A:</b> Zero tax for income ≤ Rs.12L
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GSTCalculator