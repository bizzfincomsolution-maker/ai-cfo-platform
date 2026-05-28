import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, Line, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useRealtimeDashboard } from '../useRealtimeDashboard'
import KPICard from './KPICard'

const COLORS = ['#2563eb','#16a34a','#ea580c','#7c3aed','#ca8a04','#dc2626','#0891b2','#65a30d']

const formatRs = (value) => {
  if (!value && value !== 0) return 'Rs.0'
  if (value >= 10000000) return `Rs.${(value/10000000).toFixed(1)}Cr`
  if (value >= 100000)   return `Rs.${(value/100000).toFixed(1)}L`
  if (value >= 1000)     return `Rs.${(value/1000).toFixed(1)}K`
  return `Rs.${value.toFixed(0)}`
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb',
      borderRadius: '10px', padding: '12px 16px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
      fontFamily: 'Inter, sans-serif'
    }}>
      <p style={{ margin: '0 0 8px 0', fontSize: '12px',
        color: '#6b7280', fontWeight: '600' }}>{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: '3px 0', fontSize: '13px',
          color: entry.color, fontWeight: '600' }}>
          {entry.name}: {typeof entry.value === 'number'
            ? (entry.name.includes('%') ? `${entry.value}%` : formatRs(entry.value))
            : entry.value}
        </p>
      ))}
    </div>
  )
}

// Chart Card Wrapper
const ChartCard = ({ title, subtitle, children, style = {} }) => (
  <div style={{
    background: 'white', borderRadius: '16px',
    padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.2s ease',
    ...style
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'}
  >
    <div style={{ marginBottom: '16px' }}>
      <h3 style={{
        margin: 0, fontSize: '15px', fontWeight: '600',
        color: '#111827', fontFamily: 'Inter, sans-serif'
      }}>{title}</h3>
      {subtitle && (
        <p style={{
          margin: '3px 0 0 0', fontSize: '12px',
          color: '#9ca3af', fontFamily: 'Inter, sans-serif'
        }}>{subtitle}</p>
      )}
    </div>
    {children}
  </div>
)

function Dashboard() {
  const { data, loading } = useRealtimeDashboard()
  const [forecastData, setForecastData]       = useState([])
  const [forecastSummary, setForecastSummary] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(true)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/forecast/revenue')
        const json = await res.json()
        const historical = json.data.filter(d => d.type === 'historical').slice(-12)
        const forecast   = json.data.filter(d => d.type === 'forecast')
        setForecastData([...historical, ...forecast])
        setForecastSummary(json.summary)
      } catch (err) {
        console.error('Forecast error:', err)
      } finally {
        setForecastLoading(false)
      }
    }
    fetchForecast()
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        flexDirection: 'column', gap: '16px',
        background: '#f9fafb', fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '28px',
          boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
          animation: 'bounceIn 0.5s ease'
        }}>📊</div>
        <h2 style={{ color: '#111827', fontSize: '20px',
          fontWeight: '700', margin: 0 }}>
          Loading Dashboard...
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
          Connecting to Supabase real-time database
        </p>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#2563eb', opacity: 0.6,
              animation: `pulse 1.2s ease ${i * 0.2}s infinite`
            }}/>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: '#f3f4f6', minHeight: '100vh',
      padding: '24px', fontFamily: 'Inter, sans-serif',
      animation: 'fadeSlideIn 0.35s ease forwards'
    }}>

      {/* ── Header ──────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
        borderRadius: '16px', padding: '28px 32px',
        marginBottom: '24px', color: 'white',
        boxShadow: '0 8px 32px rgba(37,99,235,0.25)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)'
        }}/>
        <div style={{
          position: 'absolute', bottom: '-60px', right: '100px',
          width: '160px', height: '160px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)'
        }}/>

        <div style={{ position: 'relative', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center',
              gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '20px'
              }}>🏢</div>
              <h1 style={{ margin: 0, fontSize: '24px',
                fontWeight: '800', letterSpacing: '-0.02em' }}>
                AI CFO Platform
              </h1>
            </div>
            <p style={{ margin: 0, opacity: 0.75, fontSize: '14px',
              fontWeight: '400' }}>
              Nexus TechServe Pvt Ltd — Real-Time Financial Dashboard
            </p>
          </div>

          {/* Live indicator */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            borderRadius: '12px', padding: '10px 16px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center',
              gap: '8px', marginBottom: '2px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#4ade80',
                boxShadow: '0 0 6px #4ade80',
                animation: 'pulse 2s infinite'
              }}/>
              <span style={{ fontSize: '12px', fontWeight: '600',
                opacity: 0.9 }}>LIVE</span>
            </div>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.8,
              fontWeight: '500' }}>
              ⚡ {data.transactions.length.toLocaleString()} transactions
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ────────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px',
        marginBottom: '24px', flexWrap: 'wrap' }}>
        <KPICard title="Total Revenue"   value={formatRs(data.totalRevenue)}
          subtitle="All income transactions"  color="#16a34a" icon="💰" />
        <KPICard title="Total Expenses"  value={formatRs(data.totalExpenses)}
          subtitle="All expense transactions" color="#dc2626" icon="📉" />
        <KPICard title="Cash Flow"       value={formatRs(data.cashFlow)}
          subtitle="Revenue minus expenses"   color="#2563eb" icon="🔄" />
        <KPICard title="Profit Margin"   value={`${data.profitMargin}%`}
          subtitle="Net profit percentage"    color="#7c3aed" icon="📈" />
      </div>

      {/* ── Charts Row 1 ─────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px',
        marginBottom: '20px', flexWrap: 'wrap' }}>

        <ChartCard
          title="Revenue vs Expenses"
          subtitle="Monthly comparison — last 12 months"
          style={{ flex: 2, minWidth: '300px' }}
        >
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={data.monthlyData.slice(-12)}
              barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3"
                stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11,
                fontFamily: 'Inter', fill: '#9ca3af' }}
                tickFormatter={v => v.substring(5)}
                axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatRs}
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px',
                fontFamily: 'Inter', paddingTop: '8px' }} />
              <Bar dataKey="revenue"  name="Revenue"
                fill="#16a34a" radius={[6,6,0,0]} />
              <Bar dataKey="expenses" name="Expenses"
                fill="#ef4444" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Expense Breakdown"
          subtitle="By category — all time"
          style={{ flex: 1, minWidth: '260px' }}
        >
          <ResponsiveContainer width="100%" height={270}>
            <PieChart>
              <Pie
                data={data.categoryData.slice(0, 6)}
                cx="50%" cy="45%"
                innerRadius={55}
                outerRadius={95}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
              >
                {data.categoryData.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatRs(v)}
                contentStyle={{ fontFamily: 'Inter', fontSize: '12px',
                  borderRadius: '10px', border: '1px solid #e5e7eb' }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px',
                  fontFamily: 'Inter', paddingTop: '8px' }}
                formatter={(value) => value.length > 12
                  ? value.substring(0, 12) + '...' : value}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2 ─────────────────────────── */}
      <div style={{ display: 'flex', gap: '16px',
        marginBottom: '20px', flexWrap: 'wrap' }}>

        <ChartCard
          title="Cash Flow Trend"
          subtitle="Monthly net cash flow — last 18 months"
          style={{ flex: 1, minWidth: '280px' }}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data.monthlyData.slice(-18)}>
              <defs>
                <linearGradient id="cashFlowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"
                stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month"
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                tickFormatter={v => v.substring(5)}
                axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatRs}
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="cashFlow"
                name="Cash Flow" stroke="#2563eb"
                strokeWidth={2.5} fill="url(#cashFlowGrad)"
                dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Profit Margin Trend"
          subtitle="Monthly profit margin % — last 18 months"
          style={{ flex: 1, minWidth: '280px' }}
        >
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data.monthlyData.slice(-18)}>
              <defs>
                <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3"
                stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month"
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                tickFormatter={v => v.substring(5)}
                axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${v}%`}
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`, 'Profit Margin']}
                contentStyle={{ fontFamily: 'Inter', fontSize: '12px',
                  borderRadius: '10px' }} />
              <Area type="monotone" dataKey="profitMargin"
                name="Profit Margin %" stroke="#7c3aed"
                strokeWidth={2.5} fill="url(#marginGrad)"
                dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Revenue Forecast ─────────────────────── */}
      <ChartCard
        title="🔮 Revenue Forecast — Next 6 Months"
        subtitle="Powered by Facebook Prophet ML • Trained on 38 months of data"
        style={{ marginBottom: '20px' }}
      >
        {/* Forecast Summary Pills */}
        {forecastSummary && (
          <div style={{ display: 'flex', gap: '12px',
            marginBottom: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'Next Month', value: formatRs(forecastSummary.next_month_forecast),
                color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
              { label: '6-Month Total', value: formatRs(forecastSummary.total_6month_forecast),
                color: '#2563eb', bg: '#eff6ff', border: '#93c5fd' },
              { label: 'Growth', value: `+${forecastSummary.growth_pct}%`,
                color: '#ea580c', bg: '#fff7ed', border: '#fdba74' },
              { label: 'Model', value: 'Prophet ML',
                color: '#7c3aed', bg: '#faf5ff', border: '#c4b5fd' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '10px 16px', borderRadius: '10px',
                background: item.bg, border: `1px solid ${item.border}`,
                textAlign: 'center', minWidth: '110px'
              }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px',
                  color: '#6b7280', fontWeight: '500' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '15px',
                  fontWeight: '700', color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {forecastLoading ? (
          <div style={{ textAlign: 'center', padding: '60px',
            color: '#9ca3af', fontFamily: 'Inter' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔮</div>
            <p style={{ fontWeight: '500' }}>Training Prophet ML model...</p>
            <p style={{ fontSize: '12px' }}>This takes 10-15 seconds</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3"
                stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="month"
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                tickFormatter={v => v.substring(5)}
                axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatRs}
                tick={{ fontSize: 11, fontFamily: 'Inter', fill: '#9ca3af' }}
                axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px',
                fontFamily: 'Inter', paddingTop: '8px' }} />
              <Bar dataKey="actual" name="Actual Revenue"
                fill="#2563eb" radius={[4,4,0,0]} opacity={0.85} />
              <Line type="monotone" dataKey="forecast"
                name="Forecast" stroke="#16a34a" strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: '#16a34a', r: 5, strokeWidth: 2,
                  stroke: 'white' }}
                connectNulls={false} />
              <Line type="monotone" dataKey="upper"
                name="Upper Bound" stroke="#86efac"
                strokeWidth={1} strokeDasharray="4 4"
                dot={false} connectNulls={false} />
              <Line type="monotone" dataKey="lower"
                name="Lower Bound" stroke="#86efac"
                strokeWidth={1} strokeDasharray="4 4"
                dot={false} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        <div style={{
          marginTop: '12px', padding: '10px 14px',
          background: '#fefce8', borderRadius: '8px',
          border: '1px solid #fde047', fontSize: '12px',
          color: '#854d0e', fontFamily: 'Inter'
        }}>
          📊 <b>How to read:</b> Blue bars = actual revenue.
          Green dashed = ML forecast. Light green = 80% confidence interval.
          Model detected Indian fiscal year seasonality patterns.
        </div>
      </ChartCard>

      {/* ── Recent Transactions ───────────────────── */}
      <ChartCard title="Recent Transactions"
        subtitle="Latest 10 transactions from your database">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Date','Vendor','Description','Amount','Type','Category'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontSize: '11px', color: '#9ca3af',
                    fontWeight: '600', borderBottom: '1px solid #f3f4f6',
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                    fontFamily: 'Inter', background: '#fafafa'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.transactions.slice(-10).reverse().map((t, i) => (
                <tr key={i} style={{ transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '12px 14px', fontSize: '13px',
                    color: '#6b7280', fontFamily: 'Inter' }}>{t.date}</td>
                  <td style={{ padding: '12px 14px', fontSize: '13px',
                    color: '#111827', fontWeight: '500',
                    fontFamily: 'Inter' }}>
                    {t.vendor?.substring(0, 22)}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px',
                    color: '#9ca3af', fontFamily: 'Inter' }}>
                    {t.description?.substring(0, 30)}...
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px',
                    fontWeight: '700', fontFamily: 'Inter',
                    color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                    {t.type === 'income' ? '+' : '-'}{formatRs(t.amount)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '999px',
                      fontSize: '11px', fontWeight: '600',
                      fontFamily: 'Inter',
                      background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                      color: t.type === 'income' ? '#16a34a' : '#dc2626'
                    }}>{t.type}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px',
                    color: '#6b7280', fontFamily: 'Inter' }}>
                    {t.category}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* ── Footer ───────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '24px 0 8px',
        color: '#d1d5db', fontSize: '12px', fontFamily: 'Inter' }}>
        ⚡ Real-time WebSocket • Facebook Prophet ML •
        Groq LLaMA 3 • AI CFO Platform — FTL Hackathon 2026
      </div>
    </div>
  )
}

export default Dashboard