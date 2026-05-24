import React from 'react'

function KPICard({ title, value, subtitle, color, icon }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`,
      flex: 1,
      minWidth: '200px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 8px 0' }}>
            {title}
          </p>
          <h2 style={{ color: '#1f2937', fontSize: '28px', margin: '0 0 4px 0', fontWeight: 'bold' }}>
            {value}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>
            {subtitle}
          </p>
        </div>
        <div style={{
          fontSize: '40px',
          opacity: 0.8
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

export default KPICard