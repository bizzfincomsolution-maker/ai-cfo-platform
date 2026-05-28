import React, { useState } from 'react'

const THEMES = {
  blue: {
    name: 'Professional Blue', description: 'Clean corporate look — default',
    preview: ['#1e3a5f', '#2563eb', '#dbeafe'],
    primary: '#2563eb', dark: '#1e3a5f', light: '#dbeafe',
  },
  dark: {
    name: 'Dark Mode', description: 'Easy on the eyes — night work',
    preview: ['#0f172a', '#334155', '#1e293b'],
    primary: '#6366f1', dark: '#0f172a', light: '#1e293b',
  },
  green: {
    name: 'Finance Green', description: 'Classic banking theme',
    preview: ['#14532d', '#16a34a', '#dcfce7'],
    primary: '#16a34a', dark: '#14532d', light: '#dcfce7',
  },
}

const INITIAL_USERS = [
  { id:1, name:'Admin User',     email:'admin@nexustechserve.com',
    role:'Admin',       status:'Active', avatar:'👤',
    joined:'2023-04-01', permissions:['dashboard','upload','gst','chat','settings'] },
  { id:2, name:'CA Manager',    email:'ca@nexustechserve.com',
    role:'CA Manager',  status:'Active', avatar:'👩‍💼',
    joined:'2023-06-15', permissions:['dashboard','gst','chat'] },
  { id:3, name:'Finance Analyst',email:'finance@nexustechserve.com',
    role:'Analyst',     status:'Active', avatar:'👨‍💻',
    joined:'2024-01-10', permissions:['dashboard','chat'] },
]

const ALL_PERMISSIONS = [
  { id:'dashboard', label:'📊 Dashboard',     desc:'View KPIs and charts'       },
  { id:'upload',    label:'📤 Upload',         desc:'Upload CSV and PDF invoices' },
  { id:'gst',       label:'🧾 GST Calculator', desc:'GST and tax calculations'    },
  { id:'chat',      label:'🤖 AI Assistant',   desc:'AI financial chat'           },
  { id:'settings',  label:'⚙️ Settings',       desc:'Manage platform settings'    },
]

const INITIAL_COMPANY = {
  name:'Nexus TechServe Pvt Ltd', gstin:'27AAACN4521R1ZP',
  pan:'AAACN4521R', address:'Plot No. 47, Baner Road, Baner',
  city:'Pune', state:'Maharashtra', pincode:'411045',
  email:'accounts@nexustechserve.com', phone:'+91-20-4567-8901',
  website:'www.nexustechserve.com', incorporatedOn:'2019-04-01',
  financialYear:'2025-26', currency:'INR (Indian Rupee)',
  industry:'IT Services & Software',
}

function Settings() {
  const [activeTab, setActiveTab]           = useState('company')
  const [theme, setTheme]                   = useState('blue')
  const [users, setUsers]                   = useState(INITIAL_USERS)
  const [company, setCompany]               = useState(INITIAL_COMPANY)
  const [editingCompany, setEditingCompany] = useState(false)
  const [showAddUser, setShowAddUser]       = useState(false)
  const [saved, setSaved]                   = useState('')
  const [newUser, setNewUser]               = useState({
    name:'', email:'', role:'Analyst', permissions:['dashboard']
  })

  const currentTheme = THEMES[theme]

  const showSaved = (msg) => {
    setSaved(msg)
    setTimeout(() => setSaved(''), 3000)
  }

  const addUser = () => {
    if (!newUser.name || !newUser.email) return
    setUsers([...users, {
      id: users.length + 1, ...newUser,
      status:'Active', avatar:'👤',
      joined: new Date().toISOString().split('T')[0]
    }])
    setNewUser({ name:'', email:'', role:'Analyst', permissions:['dashboard'] })
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
    setUsers(users.map(u => u.id === userId
      ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
      : u))
  }

  const tabs = [
    { id:'company', icon:'🏢', label:'Company Profile' },
    { id:'users',   icon:'👥', label:'User Management' },
    { id:'theme',   icon:'🎨', label:'Theme Settings'  },
  ]

  const roleColors = {
    'Admin':        { bg:'#ede9fe', color:'#7c3aed' },
    'CA Manager':   { bg:'#dbeafe', color:'#2563eb' },
    'Analyst':      { bg:'#dcfce7', color:'#16a34a' },
    'Viewer':       { bg:'#f3f4f6', color:'#6b7280' },
  }

  return (
    <div style={{ padding:'24px', background:'#f3f4f6', minHeight:'100vh',
      fontFamily:'Inter, sans-serif',
      animation:'fadeSlideIn 0.35s ease forwards' }}>

      {/* Header */}
      <div style={{
        background:`linear-gradient(135deg, ${currentTheme.dark}, ${currentTheme.primary})`,
        borderRadius:'16px', padding:'28px 32px',
        marginBottom:'24px', color:'white',
        boxShadow:`0 8px 32px ${currentTheme.primary}40`,
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
            ⚙️
          </div>
          <h1 style={{ margin:0, fontSize:'24px', fontWeight:'800',
            letterSpacing:'-0.02em' }}>Settings</h1>
        </div>
        <p style={{ margin:0, opacity:0.75, fontSize:'14px' }}>
          Manage company profile, team access and platform appearance
        </p>
      </div>

      {/* Save Toast */}
      {saved && (
        <div style={{ background:'#f0fdf4', border:'1px solid #86efac',
          borderRadius:'10px', padding:'12px 16px', marginBottom:'16px',
          color:'#16a34a', fontWeight:'600', fontSize:'13px',
          display:'flex', alignItems:'center', gap:'8px',
          animation:'slideInLeft 0.3s ease forwards' }}>
          ✅ {saved}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:'8px',
        marginBottom:'20px', flexWrap:'wrap' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding:'10px 20px', borderRadius:'10px',
            background: activeTab===tab.id ? currentTheme.primary : 'white',
            color: activeTab===tab.id ? 'white' : '#374151',
            border: `2px solid ${activeTab===tab.id
              ? currentTheme.primary : '#e5e7eb'}`,
            cursor:'pointer', fontSize:'13px', fontWeight:'600',
            transition:'all 0.2s', fontFamily:'Inter',
            boxShadow: activeTab===tab.id
              ? `0 4px 12px ${currentTheme.primary}40` : 'none'
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ── COMPANY PROFILE ─────────────────────────── */}
      {activeTab === 'company' && (
        <div style={{ background:'white', borderRadius:'16px',
          padding:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', justifyContent:'space-between',
            alignItems:'center', marginBottom:'24px' }}>
            <div>
              <h3 style={{ margin:0, fontSize:'16px', fontWeight:'700',
                color:'#111827' }}>🏢 Company Information</h3>
              <p style={{ margin:'3px 0 0 0', fontSize:'12px',
                color:'#9ca3af' }}>
                Your business details used across the platform
              </p>
            </div>
            <button onClick={() => {
              if (editingCompany) showSaved('Company profile saved!')
              setEditingCompany(!editingCompany)
            }} style={{
              padding:'9px 20px',
              background: editingCompany
                ? currentTheme.primary : 'white',
              color: editingCompany ? 'white' : currentTheme.primary,
              border:`2px solid ${currentTheme.primary}`,
              borderRadius:'10px', cursor:'pointer',
              fontSize:'13px', fontWeight:'600',
              transition:'all 0.2s', fontFamily:'Inter',
              boxShadow: editingCompany
                ? `0 4px 12px ${currentTheme.primary}40` : 'none'
            }}>
              {editingCompany ? '💾 Save Changes' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* Company fields grid */}
          <div style={{ display:'grid',
            gridTemplateColumns:'repeat(2, 1fr)', gap:'16px' }}>
            {[
              ['Company Name',    'name',           'text' ],
              ['GSTIN',          'gstin',          'text' ],
              ['PAN',            'pan',            'text' ],
              ['Official Email', 'email',          'email'],
              ['Phone Number',   'phone',          'tel'  ],
              ['Website',        'website',        'text' ],
              ['Industry',       'industry',       'text' ],
              ['Financial Year', 'financialYear',  'text' ],
              ['Currency',       'currency',       'text' ],
              ['Incorporated',   'incorporatedOn', 'date' ],
            ].map(([label, field, type]) => (
              <div key={field}>
                <label style={{ display:'block', color:'#9ca3af',
                  fontSize:'11px', fontWeight:'600', marginBottom:'5px',
                  textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  {label}
                </label>
                {editingCompany ? (
                  <input type={type} value={company[field]}
                    onChange={e => setCompany({...company, [field]:e.target.value})}
                    style={{ width:'100%', padding:'10px 12px',
                      border:`2px solid ${currentTheme.primary}`,
                      borderRadius:'9px', fontSize:'13px',
                      boxSizing:'border-box', color:'#111827',
                      fontFamily:'Inter', transition:'all 0.2s' }} />
                ) : (
                  <div style={{ padding:'10px 12px', background:'#f9fafb',
                    borderRadius:'9px', fontSize:'13px', color:'#111827',
                    border:'1px solid #f3f4f6', fontWeight:'500' }}>
                    {company[field]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Address row */}
          <div style={{ marginTop:'16px' }}>
            <label style={{ display:'block', color:'#9ca3af',
              fontSize:'11px', fontWeight:'600', marginBottom:'5px',
              textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Street Address
            </label>
            {editingCompany ? (
              <div style={{ display:'grid',
                gridTemplateColumns:'2fr 1fr 1fr', gap:'12px' }}>
                {[
                  [company.address, 'address'],
                  [company.city,    'city'   ],
                  [company.pincode, 'pincode'],
                ].map(([val, field]) => (
                  <input key={field} value={val}
                    onChange={e => setCompany({...company, [field]:e.target.value})}
                    placeholder={field.charAt(0).toUpperCase()+field.slice(1)}
                    style={{ padding:'10px 12px',
                      border:`2px solid ${currentTheme.primary}`,
                      borderRadius:'9px', fontSize:'13px',
                      boxSizing:'border-box', fontFamily:'Inter' }} />
                ))}
              </div>
            ) : (
              <div style={{ padding:'10px 12px', background:'#f9fafb',
                borderRadius:'9px', fontSize:'13px', color:'#111827',
                border:'1px solid #f3f4f6' }}>
                {company.address}, {company.city},
                {company.state} — {company.pincode}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── USER MANAGEMENT ─────────────────────────── */}
      {activeTab === 'users' && (
        <div>
          <div style={{ background:'white', borderRadius:'16px',
            padding:'24px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>

            {/* Header row */}
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:'20px' }}>
              <div>
                <h3 style={{ margin:0, fontSize:'16px', fontWeight:'700',
                  color:'#111827' }}>
                  👥 Team Members ({users.length})
                </h3>
                <p style={{ margin:'3px 0 0 0', fontSize:'12px',
                  color:'#9ca3af' }}>
                  Manage access and feature permissions
                </p>
              </div>
              <button onClick={() => setShowAddUser(!showAddUser)} style={{
                padding:'9px 18px',
                background:`linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.primary}dd)`,
                color:'white', border:'none', borderRadius:'10px',
                cursor:'pointer', fontSize:'13px', fontWeight:'600',
                boxShadow:`0 4px 12px ${currentTheme.primary}40`,
                fontFamily:'Inter', transition:'all 0.2s'
              }}>
                + Add User
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div style={{ background:'#f9fafb',
                border:`2px solid ${currentTheme.primary}`,
                borderRadius:'12px', padding:'20px',
                marginBottom:'20px',
                animation:'scaleIn 0.2s ease forwards' }}>
                <h4 style={{ margin:'0 0 16px 0', fontSize:'14px',
                  fontWeight:'700', color:currentTheme.primary }}>
                  Add New Team Member
                </h4>
                <div style={{ display:'grid',
                  gridTemplateColumns:'repeat(3, 1fr)',
                  gap:'12px', marginBottom:'16px' }}>
                  {[['Full Name','name','text'],
                    ['Email','email','email']].map(([label,field,type]) => (
                    <div key={field}>
                      <label style={{ display:'block', fontSize:'11px',
                        color:'#6b7280', fontWeight:'600',
                        marginBottom:'4px', textTransform:'uppercase',
                        letterSpacing:'0.04em' }}>{label}</label>
                      <input type={type} value={newUser[field]}
                        onChange={e => setNewUser({...newUser,[field]:e.target.value})}
                        style={{ width:'100%', padding:'9px 12px',
                          border:'1.5px solid #e5e7eb', borderRadius:'8px',
                          fontSize:'13px', boxSizing:'border-box',
                          fontFamily:'Inter' }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display:'block', fontSize:'11px',
                      color:'#6b7280', fontWeight:'600',
                      marginBottom:'4px', textTransform:'uppercase',
                      letterSpacing:'0.04em' }}>Role</label>
                    <select value={newUser.role}
                      onChange={e => setNewUser({...newUser,role:e.target.value})}
                      style={{ width:'100%', padding:'9px 12px',
                        border:'1.5px solid #e5e7eb', borderRadius:'8px',
                        fontSize:'13px', background:'white',
                        fontFamily:'Inter' }}>
                      {['Admin','CA Manager','Analyst','Viewer'].map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'11px',
                    color:'#6b7280', fontWeight:'600',
                    marginBottom:'8px', textTransform:'uppercase',
                    letterSpacing:'0.04em' }}>Feature Access</label>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {ALL_PERMISSIONS.map(p => (
                      <button key={p.id}
                        onClick={() => {
                          const perms = newUser.permissions.includes(p.id)
                            ? newUser.permissions.filter(x => x !== p.id)
                            : [...newUser.permissions, p.id]
                          setNewUser({...newUser, permissions:perms})
                        }}
                        style={{ padding:'6px 12px', borderRadius:'8px',
                          cursor:'pointer', fontSize:'12px', fontWeight:'500',
                          background: newUser.permissions.includes(p.id)
                            ? currentTheme.primary : 'white',
                          color: newUser.permissions.includes(p.id)
                            ? 'white' : '#6b7280',
                          border:`1.5px solid ${newUser.permissions.includes(p.id)
                            ? currentTheme.primary : '#e5e7eb'}`,
                          transition:'all 0.15s', fontFamily:'Inter' }}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display:'flex', gap:'10px' }}>
                  <button onClick={addUser} style={{
                    padding:'9px 20px', background:'#16a34a',
                    color:'white', border:'none', borderRadius:'8px',
                    cursor:'pointer', fontWeight:'600', fontSize:'13px',
                    boxShadow:'0 4px 8px rgba(22,163,74,0.3)',
                    fontFamily:'Inter' }}>
                    ✅ Add Member
                  </button>
                  <button onClick={() => setShowAddUser(false)} style={{
                    padding:'9px 20px', background:'white',
                    color:'#6b7280', border:'1.5px solid #e5e7eb',
                    borderRadius:'8px', cursor:'pointer',
                    fontSize:'13px', fontFamily:'Inter' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Users List */}
            {users.map((user, idx) => (
              <div key={user.id} style={{
                border:'1px solid #f3f4f6', borderRadius:'12px',
                padding:'16px', marginBottom:'10px',
                background: user.status==='Inactive' ? '#fafafa' : 'white',
                transition:'all 0.2s',
                opacity: user.status==='Inactive' ? 0.7 : 1,
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='0 4px 12px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}
              >
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'flex-start', flexWrap:'wrap', gap:'12px' }}>

                  {/* User Info */}
                  <div style={{ display:'flex', gap:'12px',
                    alignItems:'center' }}>
                    <div style={{ width:'46px', height:'46px',
                      borderRadius:'12px',
                      background:`linear-gradient(135deg, ${currentTheme.light}, ${currentTheme.primary}20)`,
                      display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:'22px',
                      border:`1px solid ${currentTheme.primary}20` }}>
                      {user.avatar}
                    </div>
                    <div>
                      <p style={{ margin:0, fontWeight:'700',
                        color:'#111827', fontSize:'14px' }}>
                        {user.name}
                        {user.id === 1 && (
                          <span style={{ marginLeft:'8px', fontSize:'10px',
                            background:'#fef9c3', color:'#854d0e',
                            padding:'2px 7px', borderRadius:'999px',
                            fontWeight:'600' }}>OWNER</span>
                        )}
                      </p>
                      <p style={{ margin:'2px 0', color:'#6b7280',
                        fontSize:'12px' }}>{user.email}</p>
                      <div style={{ display:'flex', gap:'6px',
                        marginTop:'5px', flexWrap:'wrap' }}>
                        <span style={{ padding:'2px 9px',
                          borderRadius:'999px', fontSize:'11px',
                          fontWeight:'600',
                          background: roleColors[user.role]?.bg || '#f3f4f6',
                          color: roleColors[user.role]?.color || '#6b7280' }}>
                          {user.role}
                        </span>
                        <span style={{ padding:'2px 9px',
                          borderRadius:'999px', fontSize:'11px',
                          fontWeight:'600',
                          background: user.status==='Active'
                            ? '#dcfce7' : '#fee2e2',
                          color: user.status==='Active'
                            ? '#16a34a' : '#dc2626' }}>
                          {user.status}
                        </span>
                        <span style={{ fontSize:'11px', color:'#9ca3af',
                          padding:'2px 0' }}>
                          Joined {user.joined}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => toggleStatus(user.id)} style={{
                      padding:'6px 14px',
                      background: user.status==='Active' ? '#fef2f2' : '#f0fdf4',
                      color: user.status==='Active' ? '#dc2626' : '#16a34a',
                      border:`1px solid ${user.status==='Active' ? '#fca5a5' : '#86efac'}`,
                      borderRadius:'8px', cursor:'pointer',
                      fontSize:'12px', fontFamily:'Inter',
                      transition:'all 0.2s' }}>
                      {user.status==='Active' ? '⏸ Deactivate' : '▶ Activate'}
                    </button>
                    {user.id !== 1 && (
                      <button onClick={() => deleteUser(user.id)} style={{
                        padding:'6px 12px', background:'#fef2f2',
                        color:'#dc2626', border:'1px solid #fca5a5',
                        borderRadius:'8px', cursor:'pointer',
                        fontSize:'12px', fontFamily:'Inter',
                        transition:'all 0.2s' }}>
                        🗑
                      </button>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                <div style={{ marginTop:'12px', paddingTop:'12px',
                  borderTop:'1px solid #f9fafb' }}>
                  <p style={{ margin:'0 0 8px 0', fontSize:'11px',
                    color:'#9ca3af', fontWeight:'600',
                    textTransform:'uppercase', letterSpacing:'0.04em' }}>
                    Feature Access
                  </p>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                    {ALL_PERMISSIONS.map(p => (
                      <button key={p.id}
                        onClick={() => togglePermission(user.id, p.id)}
                        title={p.desc} style={{
                          padding:'4px 11px', borderRadius:'7px',
                          cursor:'pointer', fontSize:'11px', fontWeight:'600',
                          background: user.permissions.includes(p.id)
                            ? currentTheme.primary : '#f3f4f6',
                          color: user.permissions.includes(p.id)
                            ? 'white' : '#9ca3af',
                          border:`1px solid ${user.permissions.includes(p.id)
                            ? currentTheme.primary : '#e5e7eb'}`,
                          transition:'all 0.15s', fontFamily:'Inter' }}>
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

      {/* ── THEME SETTINGS ──────────────────────────── */}
      {activeTab === 'theme' && (
        <div style={{ background:'white', borderRadius:'16px',
          padding:'28px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin:'0 0 4px 0', fontSize:'16px',
            fontWeight:'700', color:'#111827' }}>
            🎨 Platform Theme
          </h3>
          <p style={{ margin:'0 0 24px 0', fontSize:'12px', color:'#9ca3af' }}>
            Choose a color theme for your AI CFO Platform
          </p>

          <div style={{ display:'flex', gap:'20px', flexWrap:'wrap' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <div key={key} onClick={() => {
                setTheme(key)
                showSaved(`Theme changed to ${t.name}!`)
              }} style={{
                flex:1, minWidth:'200px', maxWidth:'260px',
                border:`3px solid ${theme===key ? t.primary : '#e5e7eb'}`,
                borderRadius:'14px', padding:'20px',
                cursor:'pointer', transition:'all 0.2s',
                background: theme===key ? t.light : 'white',
                boxShadow: theme===key
                  ? `0 8px 24px ${t.primary}30` : '0 2px 8px rgba(0,0,0,0.04)',
                transform: theme===key ? 'scale(1.02)' : 'scale(1)'
              }}>
                {/* Color swatches */}
                <div style={{ display:'flex', gap:'6px',
                  marginBottom:'14px', height:'36px' }}>
                  {t.preview.map((color, i) => (
                    <div key={i} style={{ flex:1, borderRadius:'8px',
                      background:color,
                      boxShadow:`0 2px 6px ${color}40` }} />
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', marginBottom:'4px' }}>
                  <h4 style={{ margin:0, fontSize:'14px', fontWeight:'700',
                    color:'#111827' }}>{t.name}</h4>
                  {theme===key && (
                    <span style={{ background:t.primary, color:'white',
                      padding:'2px 10px', borderRadius:'999px',
                      fontSize:'10px', fontWeight:'700' }}>
                      ✓ Active
                    </span>
                  )}
                </div>
                <p style={{ margin:'0 0 14px 0', color:'#9ca3af',
                  fontSize:'12px' }}>{t.description}</p>

                {/* Mini preview */}
                <div style={{ borderRadius:'8px', overflow:'hidden',
                  border:'1px solid #f3f4f6' }}>
                  <div style={{ background:t.dark, padding:'8px 10px',
                    display:'flex', alignItems:'center', gap:'6px' }}>
                    <div style={{ width:'6px', height:'6px',
                      borderRadius:'50%',
                      background:'rgba(255,255,255,0.4)' }}/>
                    <div style={{ height:'5px', width:'50px',
                      background:'rgba(255,255,255,0.3)',
                      borderRadius:'3px' }}/>
                  </div>
                  <div style={{ background:t.light, padding:'8px 10px' }}>
                    <div style={{ display:'flex', gap:'4px',
                      marginBottom:'5px' }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex:1, height:'16px',
                          borderRadius:'4px', background:t.primary,
                          opacity:0.6 }}/>
                      ))}
                    </div>
                    <div style={{ height:'24px', borderRadius:'4px',
                      background:'white',
                      border:`1px solid ${t.primary}30` }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop:'20px', padding:'12px 16px',
            background:'#fefce8', border:'1px solid #fde047',
            borderRadius:'10px', fontSize:'12px', color:'#854d0e',
            display:'flex', gap:'8px', alignItems:'flex-start' }}>
            <span>💡</span>
            <span>
              <b>Note:</b> Theme changes apply to the Settings header and
              UI elements instantly. Full theme integration across all pages
              can be extended by passing theme as a global context.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings