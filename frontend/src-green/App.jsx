function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #064e3b 0%, #022c22 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#f8fafc',
      margin: 0,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        background: 'rgba(20, 83, 45, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        borderRadius: '24px',
        padding: '40px 30px',
        textAlign: 'center',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)'
      }}>
        <h1 style={{ color: '#22c55e', fontSize: '2.5rem', fontWeight: 800 }}>
          🟢 GREEN VERSION
        </h1>
        <p style={{ color: '#a7f3d0' }}>
          This page should never actually load or stay in production!
        {/* </p> */}
      </div>
    </div>
  )
}

export default App;
