import React from 'react'

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'upload',    icon: '📤', label: 'Upload' },
    { id: 'gst',       icon: '🧾', label: 'GST Calculator' },
    { id: 'chat',      icon: '🤖', label: 'AI Assistant' },
    { id: 'settings',  icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1e3a5f, #1e40af)',
      padding: '0',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      boxShadow: '2px 0 8px rgba(0,0,0,0.2)'
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{
          color: 'white', margin: 0,
          fontSize: '18px', fontWeight: 'bold'
        }}>
          🏢 AI CFO
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.6)',
          margin: '4px 0 0 0', fontSize: '11px'
        }}>
          Nexus TechServe Pvt Ltd
        </p>
      </div>

      {/* Menu Items */}
      <nav style={{ padding: '16px 0', flex: 1 }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              width: '100%',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: activePage === item.id
                ? 'rgba(255,255,255,0.15)'
                : 'transparent',
              border: 'none',
              borderLeft: activePage === item.id
                ? '3px solid #60a5fa'
                : '3px solid transparent',
              color: activePage === item.id ? 'white' : 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activePage === item.id ? '600' : '400',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <p style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '10px', margin: 0,
          textAlign: 'center'
        }}>
          FTL Hackathon 2026
        </p>
      </div>
    </div>
  )
}

export default Sidebar