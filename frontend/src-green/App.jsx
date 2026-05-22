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
          GREEN VERSION
        </h1>
        <p style={{ color: '#a7f3d0' }}>
          {/* This is the green Version or v2 any changes or errors in this version will automatically roll back to the blue version */}
        </p>
        <h3>This is the green version live</h3>
        <h2>Hello new changes made check it </h2>
        <h2>New changes made checking everything again</h2>
      </div>
    </div>
  )
}

export default App;
