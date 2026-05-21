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
    <div style={{background:"blue"}}>
      <h1>BLUE VERSION</h1>
      <p>This is the Blue version and it is working!</p>
      <div>
        <p>Deploy Name: devops-proj-blue</p>
        <p>Backend: {backendData.version}</p>
        <p>Status Code: {backendData.status.includes('Healthy') ? '200 OK' : '500 ERROR'}</p>
      </div>
      <h2>Hello new changes made check it </h2>
      <p>Powered by Express &amp; Vite • zero-downtime routing active</p>
    </div>
  )
}

export default App
