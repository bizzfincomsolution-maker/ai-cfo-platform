import React, { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { useRealtimeDashboard } from '../useRealtimeDashboard'
import KPICard from './KPICard'

// Chart colors
const COLORS = ['#2563eb','#16a34a','#ea580c','#7c3aed','#ca8a04','#dc2626','#0891b2','#65a30d']

// Format currency
const formatRs = (value) => {
  if (!value && value !== 0) return 'Rs.0'
  if (value >= 10000000) return `Rs.${(value/10000000).toFixed(1)}Cr`
  if (value >= 100000)   return `Rs.${(value/100000).toFixed(1)}L`
  if (value >= 1000)     return `Rs.${(value/1000).toFixed(1)}K`
  return `Rs.${value.toFixed(0)}`
}

function Dashboard() {
  const { data, loading } = useRealtimeDashboard()

  // Forecast states
  const [forecastData, setForecastData]       = useState([])
  const [forecastSummary, setForecastSummary] = useState(null)
  const [forecastLoading, setForecastLoading] = useState(true)

  // Fetch forecast on mount
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/forecast/revenue')
        const json = await res.json()
        const historical = json.data
          .filter(d => d.type === 'historical')
          .slice(-12)
        const forecast = json.data
          .filter(d => d.type === 'forecast')
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
        flexDirection: 'column', gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>📊</div>
        <h2 style={{ color: '#2563eb' }}>Loading AI CFO Dashboard...</h2>
        <p style={{ color: '#6b7280' }}>Connecting to Supabase real-time database</p>
      </div>
    )
  }

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px' }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        borderRadius: '12px', padding: '24px', marginBottom: '24px',
        color: 'white'
      }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '28px' }}>
          🏢 AI CFO Platform
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Nexus TechServe Pvt Ltd — Real-Time Financial Dashboard
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.6 }}>
          ⚡ Live data from Supabase • {data.transactions.length.toLocaleString()} transactions loaded
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <KPICard
          title="Total Revenue"
          value={formatRs(data.totalRevenue)}
          subtitle="All income transactions"
          color="#16a34a"
          icon="💰"
        />
        <KPICard
          title="Total Expenses"
          value={formatRs(data.totalExpenses)}
          subtitle="All expense transactions"
          color="#dc2626"
          icon="📉"
        />
        <KPICard
          title="Cash Flow"
          value={formatRs(data.cashFlow)}
          subtitle="Revenue minus expenses"
          color="#2563eb"
          icon="🔄"
        />
        <KPICard
          title="Profit Margin"
          value={`${data.profitMargin}%`}
          subtitle="Net profit percentage"
          color="#7c3aed"
          icon="📈"
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* Revenue vs Expenses Bar Chart */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', flex: 2, minWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            📊 Revenue vs Expenses (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.monthlyData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }}
                tickFormatter={v => v.substring(5)} />
              <YAxis tickFormatter={formatRs} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatRs(v)} />
              <Legend />
              <Bar dataKey="revenue"  name="Revenue"  fill="#16a34a" radius={[4,4,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#dc2626" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Pie Chart */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', flex: 1, minWidth: '280px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            🥧 Expense Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.categoryData.slice(0, 6)}
                cx="50%" cy="50%"
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.categoryData.slice(0, 6).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatRs(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>

        {/* Cash Flow Trend */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', flex: 1, minWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            📈 Cash Flow Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.monthlyData.slice(-18)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }}
                tickFormatter={v => v.substring(5)} />
              <YAxis tickFormatter={formatRs} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => formatRs(v)} />
              <Legend />
              <Line type="monotone" dataKey="cashFlow"
                name="Cash Flow" stroke="#2563eb"
                strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Profit Margin Area Chart */}
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '24px', flex: 1, minWidth: '300px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
            💹 Profit Margin Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.monthlyData.slice(-18)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }}
                tickFormatter={v => v.substring(5)} />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Area type="monotone" dataKey="profitMargin"
                name="Profit Margin %"
                stroke="#7c3aed" fill="#ede9fe"
                strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Forecast Chart */}
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '16px',
          flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>
              🔮 Revenue Forecast — Next 6 Months
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
              Powered by Facebook Prophet ML Model • 38 months training data
            </p>
          </div>

          {/* Forecast Summary Cards */}
          {forecastSummary && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                background: '#f0fdf4', border: '1px solid #16a34a',
                borderRadius: '8px', padding: '8px 16px', textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                  Next Month Forecast
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#16a34a' }}>
                  {formatRs(forecastSummary.next_month_forecast)}
                </p>
              </div>
              <div style={{
                background: '#eff6ff', border: '1px solid #2563eb',
                borderRadius: '8px', padding: '8px 16px', textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                  6-Month Total
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2563eb' }}>
                  {formatRs(forecastSummary.total_6month_forecast)}
                </p>
              </div>
              <div style={{
                background: forecastSummary.growth_pct >= 0 ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${forecastSummary.growth_pct >= 0 ? '#16a34a' : '#dc2626'}`,
                borderRadius: '8px', padding: '8px 16px', textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>
                  Growth Forecast
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold',
                  color: forecastSummary.growth_pct >= 0 ? '#16a34a' : '#dc2626' }}>
                  {forecastSummary.growth_pct >= 0 ? '+' : ''}{forecastSummary.growth_pct}%
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Forecast Chart */}
        {forecastLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔮</div>
            <p>Training Prophet ML model on 38 months of data...</p>
            <p style={{ fontSize: '12px' }}>This takes 10-15 seconds</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                tickFormatter={v => v.substring(5)}
              />
              <YAxis tickFormatter={formatRs} tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value, name) => [formatRs(value), name]}
                labelFormatter={label => `Month: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="actual"
                name="Actual Revenue"
                fill="#2563eb"
                radius={[4,4,0,0]}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Forecasted Revenue"
                stroke="#16a34a"
                strokeWidth={3}
                strokeDasharray="8 4"
                dot={{ fill: '#16a34a', r: 5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="upper"
                name="Upper Bound"
                stroke="#86efac"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="lower"
                name="Lower Bound"
                stroke="#86efac"
                strokeWidth={1}
                strokeDasharray="4 4"
                dot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {/* Chart Legend Explanation */}
        <div style={{
          marginTop: '12px', padding: '10px 16px',
          background: '#fefce8', borderRadius: '8px',
          border: '1px solid #fde047', fontSize: '12px', color: '#713f12'
        }}>
          📊 <b>How to read:</b> Blue bars = actual historical revenue.
          Green dashed line = Prophet ML forecast.
          Light green lines = 80% confidence interval.
          Forecast based on Indian fiscal seasonality detected in your data.
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div style={{
        background: 'white', borderRadius: '12px',
        padding: '24px', marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>
          📋 Recent Transactions
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['Date','Vendor','Description','Amount','Type','Category'].map(h => (
                  <th key={h} style={{
                    padding: '12px', textAlign: 'left',
                    fontSize: '12px', color: '#6b7280',
                    fontWeight: '600', borderBottom: '1px solid #e5e7eb'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.transactions.slice(-10).reverse().map((t, i) => (
                <tr key={i} style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: i % 2 === 0 ? 'white' : '#fafafa'
                }}>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{t.date}</td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    {t.vendor?.substring(0,25)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>
                    {t.description?.substring(0,35)}...
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600',
                    color: t.type === 'income' ? '#16a34a' : '#dc2626' }}>
                    {t.type === 'income' ? '+' : '-'}{formatRs(t.amount)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '9999px', fontSize: '11px',
                      background: t.type === 'income' ? '#dcfce7' : '#fee2e2',
                      color: t.type === 'income' ? '#16a34a' : '#dc2626'
                    }}>
                      {t.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>{t.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '12px' }}>
        ⚡ Real-time updates powered by Supabase WebSockets •
        AI CFO Platform — FTL Hackathon 2026
      </div>
    </div>
  )
}

export default Dashboard