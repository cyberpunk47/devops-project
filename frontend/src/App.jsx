import { useEffect, useState } from 'react'

function App() {
  const [backendData, setBackendData] = useState({ version: 'Connecting...', status: 'Checking...' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkHealth = () => {
      fetch('/api/health')
        .then(res => {
          if (!res.ok) throw new Error('Unhealthy')
          return res.json()
        })
        .then(data => {
          setBackendData({ version: data.version, status: 'Healthy (' + data.status + ')' })
          setLoading(false)
        })
        .catch(err => {
          setBackendData({ version: 'Unknown', status: 'Unhealthy (Error)' })
          setLoading(false)
        })
    }
    checkHealth()
    const interval = setInterval(checkHealth, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: '#f8fafc',
      margin: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(14, 165, 233, 0.3)',
        borderRadius: '24px',
        padding: '40px 30px',
        textAlign: 'center',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 50px -10px rgba(14, 165, 233, 0.15)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease'
      }}>
        {/* Animated Glow Dot */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(14, 165, 233, 0.1)',
          padding: '8px 16px',
          borderRadius: '100px',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          fontSize: '0.85rem',
          color: '#38bdf8',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '24px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#0ea5e9',
            boxShadow: '0 0 10px #0ea5e9',
            animation: 'pulse 2s infinite'
          }}></span>
          Environment Active
        </div>

        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          margin: '0 0 10px 0',
          background: 'linear-gradient(to right, #38bdf8, #0ea5e9)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.02em'
        }}>
          🔵 BLUE VERSION
        </h1>
        
        <p style={{
          color: '#94a3b8',
          fontSize: '1.05rem',
          lineHeight: 1.6,
          margin: '0 0 32px 0'
        }}>
          All microservices are operational. Currently serving production traffic with v1.0 Stable release.
        </p>

        {/* Status Dashboard Panel */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          textAlign: 'left',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Deploy Name:</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f1f5f9' }}>devops-proj-blue</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Backend:</span>
            <span style={{
              fontFamily: 'monospace',
              fontWeight: 600,
              color: backendData.version === 'Unknown' ? '#ef4444' : '#38bdf8'
            }}>
              {backendData.version}
            </span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Status Code:</span>
            <span style={{
              fontFamily: 'monospace',
              fontWeight: 700,
              color: backendData.status.includes('Healthy') ? '#10b981' : '#ef4444',
              background: backendData.status.includes('Healthy') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '4px 10px',
              borderRadius: '6px',
              border: backendData.status.includes('Healthy') ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {backendData.status.includes('Healthy') ? '200 OK' : '500 ERROR'}
            </span>
            <h1>
              Hello from blue 
            </h1>
          </div>
        </div>

        <p style={{
          color: '#475569',
          fontSize: '0.75rem',
          margin: 0
        }}>
          Powered by Express &amp; Vite • zero-downtime routing active
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(14, 165, 233, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
        }
      `}</style>
    </div>
  )
}

export default App
