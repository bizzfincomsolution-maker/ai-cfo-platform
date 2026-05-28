import React from 'react'

function KPICard({ title, value, subtitle, color, icon, trend }) {
  return (
    <div
      className="kpi-card"
      style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderLeft: `4px solid ${color}`,
        flex: 1,
        minWidth: '200px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20px', right: '-20px',
        width: '100px', height: '100px', borderRadius: '50%',
        background: color, opacity: 0.06,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <p style={{
            color: '#6b7280', fontSize: '12px', margin: '0 0 10px 0',
            fontWeight: '600', textTransform: 'uppercase',
            letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif'
          }}>
            {title}
          </p>
          <h2 style={{
            color: '#111827', fontSize: '30px',
            margin: '0 0 6px 0', fontWeight: '800',
            letterSpacing: '-0.02em', fontFamily: 'Inter, sans-serif',
            lineHeight: 1
          }}>
            {value}
          </h2>
          <p style={{
            color: '#9ca3af', fontSize: '12px',
            margin: 0, fontFamily: 'Inter, sans-serif'
          }}>
            {subtitle}
          </p>
        </div>

        {/* Icon Circle */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: color + '18',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '24px',
          flexShrink: 0, marginLeft: '12px'
        }}>
          {icon}
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        width: '100%', height: '3px',
        background: `linear-gradient(90deg, ${color}40, transparent)`
      }} />
    </div>
  )
}

export default KPICard