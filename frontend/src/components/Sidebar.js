import React, { useState } from 'react'

function Sidebar({ activePage, setActivePage }) {
  const [collapsed, setCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard',      color: '#2563eb' },
    { id: 'upload',    icon: '📤', label: 'Upload',          color: '#ea580c' },
    { id: 'gst',       icon: '🧾', label: 'GST Calculator',  color: '#16a34a' },
    { id: 'chat',      icon: '🤖', label: 'AI Assistant',    color: '#7c3aed' },
    { id: 'settings',  icon: '⚙️', label: 'Settings',        color: '#6b7280' },
  ]

  return (
    <div style={{
      width: collapsed ? '72px' : '220px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0,
      zIndex: 100,
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 0' : '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        minHeight: '80px',
      }}>
        {!collapsed && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px'
              }}>🏢</div>
              <h2 style={{
                color: 'white', margin: 0, fontSize: '16px',
                fontWeight: '700', fontFamily: 'Inter, sans-serif',
                letterSpacing: '-0.01em'
              }}>AI CFO</h2>
            </div>
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              margin: '4px 0 0 40px',
              fontSize: '10px',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.02em'
            }}>
              Nexus TechServe
            </p>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none', borderRadius: '6px',
            width: '28px', height: '28px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '12px', transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.08)'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Items */}
      <nav style={{ padding: '12px 8px', flex: 1 }}>
        {!collapsed && (
          <p style={{
            color: 'rgba(255,255,255,0.25)', fontSize: '10px',
            fontWeight: '600', letterSpacing: '0.08em',
            padding: '4px 12px 8px', margin: 0,
            fontFamily: 'Inter, sans-serif',
            textTransform: 'uppercase'
          }}>
            Navigation
          </p>
        )}

        {menuItems.map(item => {
          const isActive  = activePage === item.id
          const isHovered = hoveredItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={collapsed ? item.label : ''}
              style={{
                width: '100%',
                padding: collapsed ? '12px 0' : '11px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '10px',
                background: isActive
                  ? `linear-gradient(135deg, ${item.color}30, ${item.color}18)`
                  : isHovered
                  ? 'rgba(255,255,255,0.06)'
                  : 'transparent',
                border: 'none',
                borderRadius: '10px',
                borderLeft: isActive ? `3px solid ${item.color}` : '3px solid transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '400',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                marginBottom: '2px',
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.01em',
              }}
            >
              <span style={{
                fontSize: '18px', flexShrink: 0,
                filter: isActive ? 'none' : 'grayscale(30%)'
              }}>
                {item.icon}
              </span>
              {!collapsed && (
                <span style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
              {!collapsed && isActive && (
                <div style={{
                  marginLeft: 'auto', width: '6px', height: '6px',
                  borderRadius: '50%', background: item.color,
                  flexShrink: 0,
                }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{
            background: 'rgba(37,99,235,0.2)',
            borderRadius: '10px', padding: '10px 12px',
            border: '1px solid rgba(37,99,235,0.3)',
          }}>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '10px', margin: 0,
              fontFamily: 'Inter, sans-serif',
              fontWeight: '600', letterSpacing: '0.03em'
            }}>
              🏆 FTL Hackathon 2026
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '9px', margin: '2px 0 0 0',
              fontFamily: 'Inter, sans-serif',
            }}>
              June 6, 2026
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar