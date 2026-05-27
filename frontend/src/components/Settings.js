import React, { useState } from 'react'

// ── Theme Definitions ──────────────────────────────────────
const THEMES = {
  blue: {
    name: 'Professional Blue',
    description: 'Clean corporate look — default theme',
    preview: ['#1e3a5f', '#2563eb', '#dbeafe'],
    primary: '#2563eb',
    dark:    '#1e3a5f',
    light:   '#dbeafe',
    accent:  '#16a34a',
  },
  dark: {
    name: 'Dark Mode',
    description: 'Easy on the eyes — great for night work',
    preview: ['#0f172a', '#334155', '#1e293b'],
    primary: '#6366f1',
    dark:    '#0f172a',
    light:   '#1e293b',
    accent:  '#10b981',
  },
  green: {
    name: 'Finance Green',
    description: 'Classic finance and banking theme',
    preview: ['#14532d', '#16a34a', '#dcfce7'],
    primary: '#16a34a',
    dark:    '#14532d',
    light:   '#dcfce7',
    accent:  '#2563eb',
  },
}

// ── Initial Users ──────────────────────────────────────────
const INITIAL_USERS = [
  {
    id: 1,
    name:       'Admin User',
    email:      'admin@nexustechserve.com',
    role:       'Admin',
    status:     'Active',
    permissions: ['dashboard', 'upload', 'gst', 'chat', 'settings'],
    avatar:     '👤',
    joined:     '2023-04-01',
  },
  {
    id: 2,
    name:       'CA Manager',
    email:      'ca@nexustechserve.com',
    role:       'CA Manager',
    status:     'Active',
    permissions: ['dashboard', 'gst', 'chat'],
    avatar:     '👩‍💼',
    joined:     '2023-06-15',
  },
  {
    id: 3,
    name:       'Finance Analyst',
    email:      'finance@nexustechserve.com',
    role:       'Analyst',
    status:     'Active',
    permissions: ['dashboard', 'chat'],
    avatar:     '👨‍💻',
    joined:     '2024-01-10',
  },
]

const ALL_PERMISSIONS = [
  { id: 'dashboard', label: '📊 Dashboard',      desc: 'View financial charts and KPIs' },
  { id: 'upload',    label: '📤 Upload',          desc: 'Upload CSV and PDF invoices' },
  { id: 'gst',       label: '🧾 GST Calculator',  desc: 'Calculate GST and view deadlines' },
  { id: 'chat',      label: '🤖 AI Assistant',    desc: 'Chat with AI about finances' },
  { id: 'settings',  label: '⚙️ Settings',        desc: 'Manage users and platform settings' },
]

// ── Company Info ───────────────────────────────────────────
const INITIAL_COMPANY = {
  name:          'Nexus TechServe Pvt Ltd',
  gstin:         '27AAACN4521R1ZP',
  pan:           'AAACN4521R',
  address:       'Plot No. 47, Baner Road, Baner',
  city:          'Pune',
  state:         'Maharashtra',
  pincode:       '411045',
  email:         'accounts@nexustechserve.com',
  phone:         '+91-20-4567-8901',
  website:       'www.nexustechserve.com',
  incorporatedOn:'2019-04-01',
  financialYear: '2025-26',
  currency:      'INR (Indian Rupee)',
  industry:      'IT Services & Software',
}

function Settings() {
  const [activeTab, setActiveTab]       = useState('company')
  const [theme, setTheme]               = useState('blue')
  const [users, setUsers]               = useState(INITIAL_USERS)
  const [company, setCompany]           = useState(INITIAL_COMPANY)
  const [editingCompany, setEditingCompany] = useState(false)
  const [showAddUser, setShowAddUser]   = useState(false)
  const [saved, setSaved]               = useState('')

  const [newUser, setNewUser] = useState({
    name: '', email: '', role: 'Analyst',
    permissions: ['dashboard'],
  })

  const currentTheme = THEMES[theme]

  const showSaved = (msg) => {
    setSaved(msg)
    setTimeout(() => setSaved(''), 3000)
  }

  const tabs = [
    { id: 'company', icon: '🏢', label: 'Company Profile' },
    { id: 'users',   icon: '👥', label: 'User Management' },
    { id: 'theme',   icon: '🎨', label: 'Theme Settings' },
  ]

  // ── Add User ─────────────────────────────────────────────
  const addUser = () => {
    if (!newUser.name || !newUser.email) return
    const user = {
      id:          users.length + 1,
      name:        newUser.name,
      email:       newUser.email,
      role:        newUser.role,
      status:      'Active',
      permissions: newUser.permissions,
      avatar:      '👤',
      joined:      new Date().toISOString().split('T')[0],
    }
    setUsers([...users, user])
    setNewUser({ name: '', email: '', role: 'Analyst', permissions: ['dashboard'] })
    setShowAddUser(false)
    showSaved('User added successfully!')
  }

  const deleteUser = (id) => {
    if (id === 1) { alert('Cannot delete Admin user!'); return }
    setUsers(users.filter(u => u.id !== id))
    showSaved('User removed!')
  }

  const togglePermission = (userId, perm) => {
    setUsers(users.map(u => {
      if (u.id !== userId) return u
      const perms = u.permissions.includes(perm)
        ? u.permissions.filter(p => p !== perm)
        : [...u.permissions, perm]
      return { ...u, permissions: perms }
    }))
  }

  const toggleStatus = (userId) => {
    if (userId === 1) { alert('Cannot deactivate Admin!'); return }
    setUsers(users.map(u =>
      u.id === userId
        ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
        : u
    ))
  }

  return (
    <div style={{ padding: '24px', background: '#f3f4f6', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${currentTheme.dark}, ${currentTheme.primary})`,
        borderRadius: '12px', padding: '24px',
        marginBottom: '24px', color: 'white'
      }}>
        <h1 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>
          ⚙️ Settings
        </h1>
        <p style={{ margin: 0, opacity: 0.8 }}>
          Manage company profile, users, permissions and platform appearance
        </p>
      </div>

      {/* Save notification */}
      {saved && (
        <div style={{
          background: '#dcfce7', border: '1px solid #16a34a',
          borderRadius: '8px', padding: '12px 16px',
          marginBottom: '16px', color: '#16a34a',
          fontWeight: '600', fontSize: '14px'
        }}>
          ✅ {saved}
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '8px',
        marginBottom: '24px', flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px',
              background: activeTab === tab.id ? currentTheme.primary : 'white',
              color: activeTab === tab.id ? 'white' : '#374151',
              border: `2px solid ${activeTab === tab.id ? currentTheme.primary : '#e5e7eb'}`,
              borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              transition: 'all 0.2s'
            }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: COMPANY PROFILE ──────────────────────── */}
      {activeTab === 'company' && (
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, color: '#1f2937' }}>🏢 Company Information</h3>
            <button
              onClick={() => {
                if (editingCompany) showSaved('Company profile saved!')
                setEditingCompany(!editingCompany)
              }}
              style={{
                padding: '8px 20px',
                background: editingCompany ? currentTheme.primary : 'white',
                color: editingCompany ? 'white' : currentTheme.primary,
                border: `2px solid ${currentTheme.primary}`,
                borderRadius: '8px', cursor: 'pointer',
                fontSize: '14px', fontWeight: '600'
              }}>
              {editingCompany ? '💾 Save Changes' : '✏️ Edit Profile'}
            </button>
          </div>

          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {[
              ['Company Name',     'name',          'text'],
              ['GSTIN',           'gstin',         'text'],
              ['PAN',             'pan',           'text'],
              ['Official Email',  'email',         'email'],
              ['Phone Number',    'phone',         'tel'],
              ['Website',        'website',        'text'],
              ['Industry',       'industry',       'text'],
              ['Financial Year', 'financialYear',  'text'],
              ['Currency',       'currency',       'text'],
              ['Incorporated On','incorporatedOn', 'date'],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label style={{
                  display: 'block', color: '#6b7280',
                  fontSize: '12px', fontWeight: '600',
                  marginBottom: '4px', textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {label}
                </label>
                {editingCompany ? (
                  <input
                    type={type}
                    value={company[field]}
                    onChange={e => setCompany({...company, [field]: e.target.value})}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: `2px solid ${currentTheme.primary}`,
                      borderRadius: '8px', fontSize: '14px',
                      boxSizing: 'border-box', color: '#1f2937'
                    }}
                  />
                ) : (
                  <p style={{
                    margin: 0, padding: '10px 12px',
                    background: '#f9fafb', borderRadius: '8px',
                    fontSize: '14px', color: '#1f2937',
                    border: '1px solid #e5e7eb', fontWeight: '500'
                  }}>
                    {company[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Address — full width */}
          <div style={{ marginTop: '20px' }}>
            <label style={{
              display: 'block', color: '#6b7280',
              fontSize: '12px', fontWeight: '600',
              marginBottom: '4px', textTransform: 'uppercase'
            }}>
              Street Address
            </label>
            {editingCompany ? (
              <input
                value={company.address}
                onChange={e => setCompany({...company, address: e.target.value})}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: `2px solid ${currentTheme.primary}`,
                  borderRadius: '8px', fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            ) : (
              <p style={{
                margin: 0, padding: '10px 12px',
                background: '#f9fafb', borderRadius: '8px',
                fontSize: '14px', color: '#1f2937',
                border: '1px solid #e5e7eb'
              }}>
                {company.address}, {company.city}, {company.state} - {company.pincode}
              </p>
            )}
          </div>

          {editingCompany && (
            <div style={{ display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '16px' }}>
              {[['City', 'city'], ['State', 'state'], ['Pincode', 'pincode']].map(([label, field]) => (
                <div key={field}>
                  <label style={{
                    display: 'block', color: '#6b7280',
                    fontSize: '12px', fontWeight: '600', marginBottom: '4px'
                  }}>{label}</label>
                  <input
                    value={company[field]}
                    onChange={e => setCompany({...company, [field]: e.target.value})}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: `2px solid ${currentTheme.primary}`,
                      borderRadius: '8px', fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: USER MANAGEMENT ──────────────────────── */}
      {activeTab === 'users' && (
        <div>
          {/* Users List */}
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#1f2937' }}>
                👥 Users ({users.length})
              </h3>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                style={{
                  padding: '8px 20px',
                  background: currentTheme.primary, color: 'white',
                  border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600'
                }}>
                + Add User
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div style={{
                background: '#f9fafb', border: `2px solid ${currentTheme.primary}`,
                borderRadius: '12px', padding: '20px', marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: currentTheme.primary }}>
                  Add New User
                </h4>
                <div style={{ display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                  marginBottom: '16px' }}>
                  {[
                    ['Full Name', 'name', 'text'],
                    ['Email',    'email', 'email'],
                  ].map(([label, field, type]) => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: '12px',
                        color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                        {label}
                      </label>
                      <input
                        type={type}
                        value={newUser[field]}
                        onChange={e => setNewUser({...newUser, [field]: e.target.value})}
                        style={{
                          width: '100%', padding: '8px 12px',
                          border: '1px solid #d1d5db', borderRadius: '6px',
                          fontSize: '14px', boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px',
                      color: '#6b7280', fontWeight: '600', marginBottom: '4px' }}>
                      Role
                    </label>
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      style={{
                        width: '100%', padding: '8px 12px',
                        border: '1px solid #d1d5db', borderRadius: '6px',
                        fontSize: '14px', background: 'white'
                      }}>
                      {['Admin', 'CA Manager', 'Analyst', 'Viewer'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px',
                    color: '#6b7280', fontWeight: '600', marginBottom: '8px' }}>
                    Feature Permissions
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {ALL_PERMISSIONS.map(p => (
                      <label key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                        background: newUser.permissions.includes(p.id)
                          ? currentTheme.light : '#f3f4f6',
                        border: `1px solid ${newUser.permissions.includes(p.id)
                          ? currentTheme.primary : '#e5e7eb'}`,
                        fontSize: '13px', color: '#374151'
                      }}>
                        <input
                          type="checkbox"
                          checked={newUser.permissions.includes(p.id)}
                          onChange={() => {
                            const perms = newUser.permissions.includes(p.id)
                              ? newUser.permissions.filter(x => x !== p.id)
                              : [...newUser.permissions, p.id]
                            setNewUser({...newUser, permissions: perms})
                          }}
                        />
                        {p.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={addUser} style={{
                    padding: '10px 24px', background: '#16a34a', color: 'white',
                    border: 'none', borderRadius: '8px',
                    cursor: 'pointer', fontWeight: '600', fontSize: '14px'
                  }}>
                    ✅ Add User
                  </button>
                  <button onClick={() => setShowAddUser(false)} style={{
                    padding: '10px 24px', background: 'white', color: '#6b7280',
                    border: '1px solid #e5e7eb', borderRadius: '8px',
                    cursor: 'pointer', fontSize: '14px'
                  }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            {users.map(user => (
              <div key={user.id} style={{
                border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '16px', marginBottom: '12px',
                background: user.status === 'Inactive' ? '#fafafa' : 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>

                  {/* User Info */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      background: currentTheme.light, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                    }}>
                      {user.avatar}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: '700', color: '#1f2937',
                        fontSize: '15px' }}>{user.name}</p>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                        {user.email}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '9999px',
                          fontSize: '11px', fontWeight: '600',
                          background: currentTheme.light, color: currentTheme.primary
                        }}>{user.role}</span>
                        <span style={{
                          padding: '2px 8px', borderRadius: '9999px',
                          fontSize: '11px', fontWeight: '600',
                          background: user.status === 'Active' ? '#dcfce7' : '#fee2e2',
                          color: user.status === 'Active' ? '#16a34a' : '#dc2626'
                        }}>{user.status}</span>
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          Joined: {user.joined}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleStatus(user.id)}
                      style={{
                        padding: '6px 14px',
                        background: user.status === 'Active' ? '#fef2f2' : '#dcfce7',
                        color: user.status === 'Active' ? '#dc2626' : '#16a34a',
                        border: `1px solid ${user.status === 'Active' ? '#fca5a5' : '#86efac'}`,
                        borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                      }}>
                      {user.status === 'Active' ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    {user.id !== 1 && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        style={{
                          padding: '6px 14px', background: '#fef2f2',
                          color: '#dc2626', border: '1px solid #fca5a5',
                          borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                        }}>
                        🗑 Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div style={{ marginTop: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px',
                    color: '#6b7280', fontWeight: '600' }}>
                    Feature Access:
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {ALL_PERMISSIONS.map(p => (
                      <button key={p.id}
                        onClick={() => togglePermission(user.id, p.id)}
                        title={p.desc}
                        style={{
                          padding: '4px 10px', borderRadius: '6px',
                          cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                          background: user.permissions.includes(p.id)
                            ? currentTheme.primary : '#f3f4f6',
                          color: user.permissions.includes(p.id) ? 'white' : '#6b7280',
                          border: `1px solid ${user.permissions.includes(p.id)
                            ? currentTheme.primary : '#e5e7eb'}`,
                          transition: 'all 0.15s'
                        }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: THEME SETTINGS ───────────────────────── */}
      {activeTab === 'theme' && (
        <div style={{
          background: 'white', borderRadius: '12px',
          padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
            🎨 Choose Platform Theme
          </h3>
          <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
            Select a theme to customize the look and feel of your AI CFO Platform
          </p>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <div key={key}
                onClick={() => { setTheme(key); showSaved(`Theme changed to ${t.name}!`) }}
                style={{
                  flex: 1, minWidth: '220px', maxWidth: '280px',
                  border: `3px solid ${theme === key ? t.primary : '#e5e7eb'}`,
                  borderRadius: '12px', padding: '20px', cursor: 'pointer',
                  background: theme === key ? t.light : 'white',
                  transition: 'all 0.2s',
                  boxShadow: theme === key ? `0 4px 12px ${t.primary}40` : 'none'
                }}>

                {/* Color Preview */}
                <div style={{ display: 'flex', gap: '6px',
                  marginBottom: '16px', height: '40px' }}>
                  {t.preview.map((color, i) => (
                    <div key={i} style={{
                      flex: 1, borderRadius: '6px', background: color
                    }} />
                  ))}
                </div>

                {/* Theme Name */}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ margin: 0, color: '#1f2937', fontSize: '15px' }}>
                    {t.name}
                  </h4>
                  {theme === key && (
                    <span style={{
                      background: t.primary, color: 'white',
                      padding: '2px 10px', borderRadius: '9999px',
                      fontSize: '11px', fontWeight: '600'
                    }}>Active</span>
                  )}
                </div>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>
                  {t.description}
                </p>

                {/* Sample UI Preview */}
                <div style={{
                  marginTop: '14px', borderRadius: '8px',
                  overflow: 'hidden', border: '1px solid #e5e7eb'
                }}>
                  <div style={{
                    background: t.dark, padding: '8px 12px',
                    display: 'flex', gap: '6px', alignItems: 'center'
                  }}>
                    <div style={{ width: '8px', height: '8px',
                      borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}/>
                    <div style={{ height: '6px', width: '60px',
                      background: 'rgba(255,255,255,0.4)', borderRadius: '3px' }}/>
                  </div>
                  <div style={{ background: t.light, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{
                          flex: 1, height: '20px', borderRadius: '4px',
                          background: t.primary, opacity: 0.7
                        }}/>
                      ))}
                    </div>
                    <div style={{
                      height: '30px', borderRadius: '4px',
                      background: 'white', border: `1px solid ${t.primary}40`
                    }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: '24px', padding: '16px',
            background: '#fefce8', border: '1px solid #fde047',
            borderRadius: '8px', fontSize: '13px', color: '#713f12'
          }}>
            💡 <b>Note:</b> Theme changes apply to the Settings page header instantly.
            Full theme integration across all pages can be implemented by passing
            the theme color as a prop to all components.
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings