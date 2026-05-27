import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Upload from './components/Upload'
import GSTCalculator from './components/GSTCalculator'
import AIChat from './components/AIChat'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [activePage, setActivePage] = useState('dashboard')

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />
      case 'upload':    return <Upload />
      case 'gst':       return <GSTCalculator />
      case 'chat':      return <AIChat />
      case 'settings':  return <Settings />
      default:          return <Dashboard />
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{
        marginLeft: '220px',
        flex: 1,
        minHeight: '100vh',
        background: '#f3f4f6'
      }}>
        {renderPage()}
      </div>
    </div>
  )
}

export default App