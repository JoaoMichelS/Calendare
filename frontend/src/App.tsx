import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [message, setMessage] = useState<string>('')
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Testar conexão com o backend
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'

        const [msgResponse, healthResponse] = await Promise.all([
          axios.get(`${apiUrl}/`),
          axios.get(`${apiUrl}/health`)
        ])

        setMessage(msgResponse.data)
        setHealth(healthResponse.data)
      } catch (error) {
        console.error('Erro ao conectar com o backend:', error)
        setMessage('Erro ao conectar com o backend')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Calendare</h1>
        <p>Frontend React + TypeScript</p>

        {loading ? (
          <p>Carregando...</p>
        ) : (
          <div className="backend-status">
            <h2>Status do Backend:</h2>
            <p>{message}</p>
            {health && (
              <div className="health-info">
                <p>Status: {health.status}</p>
                <p>Serviço: {health.service}</p>
                <p>Timestamp: {new Date(health.timestamp).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  )
}

export default App
